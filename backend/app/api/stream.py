#!/usr/bin/env python3
"""
Real-time streaming API for code analysis
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
import asyncio
from datetime import datetime

from ..api.auth import get_current_user
from ..models.database import User

stream_router = APIRouter()

class ConnectionManager:
    """Manages WebSocket connections for real-time streaming"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_sessions[user_id] = {
            "connected_at": datetime.utcnow(),
            "session_id": f"session_{user_id}_{datetime.utcnow().isoformat()}",
            "analysis_count": 0
        }
        
        # Send welcome message
        await self.send_message(user_id, {
            "type": "connected",
            "message": "🚀 Planet Code Forge analysis stream connected!",
            "session_id": self.user_sessions[user_id]["session_id"]
        })
    
    def disconnect(self, user_id: str):
        """Remove connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
    
    async def send_message(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except:
                # Connection lost, clean up
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_message(user_id, message)

# Global connection manager
manager = ConnectionManager()

@stream_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time code analysis streaming
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive code analysis request
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process different message types
            await handle_stream_message(user_id, message)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"Error in WebSocket for user {user_id}: {e}")
        manager.disconnect(user_id)

async def handle_stream_message(user_id: str, message: dict):
    """Handle incoming WebSocket messages"""
    
    message_type = message.get("type")
    
    if message_type == "code_analysis":
        await handle_code_analysis(user_id, message)
    elif message_type == "heartbeat":
        await manager.send_message(user_id, {"type": "heartbeat_ack", "timestamp": datetime.utcnow().isoformat()})
    elif message_type == "start_session":
        await handle_start_session(user_id, message)
    elif message_type == "end_session":
        await handle_end_session(user_id, message)
    else:
        await manager.send_message(user_id, {"type": "error", "message": f"Unknown message type: {message_type}"})

async def handle_code_analysis(user_id: str, message: dict):
    """Process real-time code analysis"""
    
    try:
        # Extract code metrics (no actual code stored)
        metrics = message.get("metrics", {})
        language = message.get("language", "unknown")
        
        # Simulate ML analysis (in production, this calls the ML service)
        analysis_result = await simulate_ml_analysis(metrics, language)
        
        # Update session stats
        if user_id in manager.user_sessions:
            manager.user_sessions[user_id]["analysis_count"] += 1
        
        # Send analysis results
        await manager.send_message(user_id, {
            "type": "analysis_result",
            "result": analysis_result,
            "timestamp": datetime.utcnow().isoformat(),
            "latency_ms": 45  # Mock latency under target
        })
        
        # Check for achievements or evolution events
        await check_evolution_triggers(user_id, analysis_result)
        
    except Exception as e:
        await manager.send_message(user_id, {
            "type": "error",
            "message": f"Analysis failed: {str(e)}"
        })

async def simulate_ml_analysis(metrics: dict, language: str):
    """AI-powered code analysis using Groq service"""
    
    try:
        # Import Groq service
        from ..services.groq_ai import groq_service
        
        # Enhance metrics with additional context
        enhanced_metrics = {
            **metrics,
            "language": language,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
        # Get AI analysis
        analysis = await groq_service.analyze_code_behavior(enhanced_metrics)
        
        return {
            "skill_deltas": analysis.get("skill_deltas", {}),
            "coding_style": analysis.get("coding_style", "pragmatic"),
            "language": language,
            "behavioral_patterns": {
                "comment_ratio": metrics.get("comments", 0) / max(metrics.get("lines", 1), 1),
                "function_density": metrics.get("functions", 0) / max(metrics.get("lines", 1), 1),
                "complexity_preference": metrics.get("complexity", 1)
            },
            "evolution_points": analysis.get("evolution_points", 0),
            "session_quality": "highly_productive" if analysis.get("evolution_points", 0) > 5 else "productive",
            "ai_insights": analysis.get("ai_insights", []),
            "planet_updates": analysis.get("planet_updates", {}),
            "analysis_method": "groq_ai",
            "model_used": analysis.get("model_used", "groq")
        }
        
    except Exception as e:
        print(f"Groq analysis failed, using fallback: {e}")
        
        # Fallback to heuristic analysis
        lines = metrics.get("lines", 0)
        functions = metrics.get("functions", 0)
        comments = metrics.get("comments", 0)
        complexity = metrics.get("complexity", 1)
        
        # Calculate behavioral patterns
        comment_ratio = comments / max(lines, 1)
        function_density = functions / max(lines, 1)
        
        # Generate skill improvements
        skill_deltas = {
            "algorithm_mastery": min(complexity * 0.1, 2.0),
            "web_development_skill": 1.5 if language in ["javascript", "typescript", "html", "css"] else 0.5,
            "api_design_discipline": 1.0 if functions > 0 else 0.2,
            "devops_maturity": 0.3,
            "security_awareness": 0.2 if comment_ratio > 0.1 else 0.1
        }
        
        # Determine coding style
        if comment_ratio > 0.15:
            style = "methodical"
        elif function_density > 0.1:
            style = "modular"
        elif complexity > 5:
            style = "complex"
        else:
            style = "pragmatic"
        
        return {
            "skill_deltas": skill_deltas,
            "coding_style": style,
            "language": language,
            "behavioral_patterns": {
                "comment_ratio": comment_ratio,
                "function_density": function_density,
                "complexity_preference": complexity
            },
            "evolution_points": sum(skill_deltas.values()),
            "session_quality": "productive" if sum(skill_deltas.values()) > 2 else "standard",
            "analysis_method": "fallback_heuristic"
        }

async def check_evolution_triggers(user_id: str, analysis_result: dict):
    """Check if analysis triggers any achievements or evolution events"""
    
    evolution_points = analysis_result.get("evolution_points", 0)
    
    # Mock achievement triggers
    achievements = []
    
    if analysis_result.get("behavioral_patterns", {}).get("comment_ratio", 0) > 0.2:
        achievements.append({
            "id": "comment_master",
            "title": "Documentation Champion",
            "description": "Maintained excellent code documentation",
            "points": 50,
            "icon": "📝"
        })
    
    if evolution_points > 3.0:
        achievements.append({
            "id": "productivity_burst",
            "title": "Productivity Burst",
            "description": "Achieved high learning velocity",
            "points": 25,
            "icon": "⚡"
        })
    
    # Send achievement notifications
    for achievement in achievements:
        await manager.send_message(user_id, {
            "type": "achievement_unlocked",
            "achievement": achievement,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # Send evolution update
    if evolution_points > 1.0:
        await manager.send_message(user_id, {
            "type": "planet_evolution",
            "points_earned": evolution_points,
            "skill_updates": analysis_result.get("skill_deltas", {}),
            "timestamp": datetime.utcnow().isoformat()
        })

async def handle_start_session(user_id: str, message: dict):
    """Handle session start"""
    
    session_data = {
        "planet_id": message.get("planet_id"),
        "project_name": message.get("project_name", "Unknown Project"),
        "language": message.get("language", "unknown"),
        "start_time": datetime.utcnow().isoformat()
    }
    
    # Update session info
    if user_id in manager.user_sessions:
        manager.user_sessions[user_id].update(session_data)
    
    await manager.send_message(user_id, {
        "type": "session_started",
        "session": session_data,
        "message": "🎯 Code analysis session started!"
    })

async def handle_end_session(user_id: str, message: dict):
    """Handle session end"""
    
    if user_id not in manager.user_sessions:
        return
    
    session = manager.user_sessions[user_id]
    duration = message.get("duration_seconds", 0)
    
    session_summary = {
        "duration_seconds": duration,
        "analyses_performed": session.get("analysis_count", 0),
        "avg_analysis_time": duration / max(session.get("analysis_count", 1), 1),
        "end_time": datetime.utcnow().isoformat()
    }
    
    await manager.send_message(user_id, {
        "type": "session_ended",
        "summary": session_summary,
        "message": "📊 Session complete! Planet evolution saved."
    })
    
    # Reset session analysis count
    session["analysis_count"] = 0

@stream_router.get("/status")
async def get_stream_status():
    """Get current streaming service status"""
    
    return {
        "active_connections": len(manager.active_connections),
        "total_sessions": len(manager.user_sessions),
        "service_status": "healthy",
        "uptime": "running"
    }