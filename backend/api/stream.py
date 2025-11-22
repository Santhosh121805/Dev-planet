#!/usr/bin/env python3
"""
Real-time code streaming API endpoints
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import Dict, Any
import json
import asyncio
from loguru import logger
from datetime import datetime

from services.code_stream_ingestor import CodeStreamIngestor
from api.auth import get_current_user
from models.database import User

router = APIRouter()
security = HTTPBearer()

# Global ingestor instance (injected by main app)
code_ingestor: CodeStreamIngestor = None

class ConnectionManager:
    """Manage WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, str] = {}  # user_id -> session_id
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"🔗 WebSocket connected for user {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
        logger.info(f"🔗 WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast_message(self, message: dict):
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to broadcast to {user_id}: {e}")
                self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time code analysis updates"""
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive code stream data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get('type')
            
            if message_type == 'start_session':
                await handle_start_session(user_id, message, websocket)
                
            elif message_type == 'code_stream':
                await handle_code_stream(user_id, message, websocket)
                
            elif message_type == 'end_session':
                await handle_end_session(user_id, message, websocket)
                
            elif message_type == 'ping':
                await websocket.send_text(json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.utcnow().isoformat()
                }))
                
            else:
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        
        # Clean up any active sessions
        if user_id in manager.user_sessions:
            session_id = manager.user_sessions[user_id]
            try:
                await code_ingestor.end_session(session_id)
            except Exception as e:
                logger.error(f"Failed to clean up session {session_id}: {e}")
        
        logger.info(f"🔌 User {user_id} disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

async def handle_start_session(user_id: str, message: Dict, websocket: WebSocket):
    """Handle session start request"""
    try:
        session_metadata = message.get('metadata', {})
        session_id = await code_ingestor.start_session(user_id, session_metadata)
        
        manager.user_sessions[user_id] = session_id
        
        response = {
            'type': 'session_started',
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        error_response = {
            'type': 'error',
            'message': f'Failed to start session: {str(e)}'
        }
        await websocket.send_text(json.dumps(error_response))

async def handle_code_stream(user_id: str, message: Dict, websocket: WebSocket):
    """Handle real-time code streaming"""
    try:
        session_id = manager.user_sessions.get(user_id)
        if not session_id:
            raise ValueError("No active session found")
        
        code_content = message.get('code', '')
        edit_metadata = message.get('metadata', {})
        
        # Process code stream (returns real-time analysis)
        analysis_result = await code_ingestor.process_code_stream(
            session_id, code_content, edit_metadata
        )
        
        # Send analysis back to client
        response = {
            'type': 'analysis_update',
            'analysis': analysis_result,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        error_response = {
            'type': 'error', 
            'message': f'Failed to process code stream: {str(e)}'
        }
        await websocket.send_text(json.dumps(error_response))

async def handle_end_session(user_id: str, message: Dict, websocket: WebSocket):
    """Handle session end request"""
    try:
        session_id = manager.user_sessions.get(user_id)
        if not session_id:
            raise ValueError("No active session found")
        
        session_summary = await code_ingestor.end_session(session_id)
        
        # Clean up
        if user_id in manager.user_sessions:
            del manager.user_sessions[user_id]
        
        response = {
            'type': 'session_ended',
            'session_summary': session_summary,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        error_response = {
            'type': 'error',
            'message': f'Failed to end session: {str(e)}'
        }
        await websocket.send_text(json.dumps(error_response))

# REST API endpoints for code submission (alternative to WebSocket)

@router.post("/submit")
async def submit_code(
    code_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Submit code for analysis (REST API alternative)"""
    
    try:
        user_id = str(current_user.id)
        
        # Start session
        session_metadata = {
            'language': code_data.get('language', 'unknown'),
            'filename': code_data.get('filename'),
            'submission_type': 'api'
        }
        
        session_id = await code_ingestor.start_session(user_id, session_metadata)
        
        # Process code
        code_content = code_data.get('code', '')
        edit_metadata = code_data.get('metadata', {})
        
        analysis_result = await code_ingestor.process_code_stream(
            session_id, code_content, edit_metadata
        )
        
        # End session
        session_summary = await code_ingestor.end_session(session_id)
        
        return {
            'success': True,
            'session_id': session_id,
            'analysis': analysis_result,
            'session_summary': session_summary,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Code submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-sessions")
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    """Get active coding sessions for current user"""
    
    user_id = str(current_user.id)
    
    active_session = manager.user_sessions.get(user_id)
    
    return {
        'user_id': user_id,
        'active_session': active_session,
        'connected': user_id in manager.active_connections,
        'timestamp': datetime.utcnow().isoformat()
    }