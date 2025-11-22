#!/usr/bin/env python3
"""
Code Stream Ingestor - Real-time code analysis service

Streams user code events and extracts behavioral patterns without storing source code.
"""

import asyncio
import json
from typing import Dict, Any, Optional, Callable
from dataclasses import asdict
import time
from loguru import logger
import aioredis
from datetime import datetime, timedelta

from models.database import CodeSession, SessionLocal
from services.genome_lab import GenomeLabEngine
from config import config

# Import from our notebook code
import sys
sys.path.append('..')
try:
    from backend_architecture import CodeAnalysisEngine, CodingBehaviorMetrics
except ImportError:
    # Fallback implementation if notebook code not available
    from services.code_analysis import CodeAnalysisEngine, CodingBehaviorMetrics

class CodeStreamIngestor:
    """Handles real-time code streaming and analysis"""
    
    def __init__(self):
        self.redis = None
        self.analysis_engine = CodeAnalysisEngine()
        self.active_sessions: Dict[str, Dict] = {}
        self.running = False
        self.message_queue = asyncio.Queue()
        
    async def start(self):
        """Initialize the code stream ingestor"""
        try:
            # Connect to Redis for real-time communication
            self.redis = aioredis.from_url(config.redis_url)
            
            # Start background tasks
            self.running = True
            asyncio.create_task(self._process_message_queue())
            
            logger.info("⚙️ Code Stream Ingestor started")
            
        except Exception as e:
            logger.error(f"Failed to start Code Stream Ingestor: {e}")
            raise
    
    async def stop(self):
        """Stop the code stream ingestor"""
        self.running = False
        
        if self.redis:
            await self.redis.close()
        
        logger.info("🛑 Code Stream Ingestor stopped")
    
    def is_running(self) -> bool:
        return self.running
    
    async def start_session(self, user_id: str, session_metadata: Dict) -> str:
        """Start a new coding session for a user"""
        session_id = f"session_{user_id}_{int(time.time())}"
        
        session_data = {
            'user_id': user_id,
            'session_id': session_id,
            'start_time': time.time(),
            'language': session_metadata.get('language', 'unknown'),
            'filename': session_metadata.get('filename'),
            'edit_count': 0,
            'total_characters': 0,
            'behavior_samples': []
        }
        
        self.active_sessions[session_id] = session_data
        
        # Cache session in Redis
        await self.redis.setex(
            f"session:{session_id}", 
            config.CODE_ANALYSIS_TIMEOUT,
            json.dumps(session_data, default=str)
        )
        
        logger.info(f"🚀 Started coding session {session_id} for user {user_id}")
        return session_id
    
    async def process_code_stream(self, session_id: str, code_content: str, 
                                edit_metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Process incoming code stream and extract behavioral patterns"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found or expired")
        
        session = self.active_sessions[session_id]
        
        try:
            # Analyze code behavior (without storing the actual code)
            edit_time = edit_metadata.get('edit_time_ms', 0) if edit_metadata else 0
            
            behavior_metrics = self.analysis_engine.analyze_code_behavior(
                code=code_content,
                filename=session['filename'],
                edit_time_ms=edit_time
            )
            
            # Update session statistics
            session['edit_count'] += 1
            session['total_characters'] = len(code_content)
            session['last_activity'] = time.time()
            session['behavior_samples'].append({
                'timestamp': time.time(),
                'metrics_hash': behavior_metrics.to_hash(),
                'edit_time_ms': edit_time
            })
            
            # Generate real-time analysis result for frontend
            analysis_result = {
                'session_id': session_id,
                'analysis_timestamp': datetime.utcnow().isoformat(),
                'behavior_insights': {
                    'code_elegance': behavior_metrics.indentation_consistency * 100,
                    'comment_poetry': behavior_metrics.comment_quality_score * 100,
                    'refactor_halo': behavior_metrics.code_reuse_score * 100,
                    'naming_gravity': behavior_metrics.naming_convention_score * 100,
                    'creativity_storm': behavior_metrics.innovation_drive * 100 if hasattr(behavior_metrics, 'innovation_drive') else 50
                },
                'skill_indicators': {
                    'algorithm_patterns': min(100, behavior_metrics.function_complexity_avg * 20),
                    'web_development': min(100, behavior_metrics.oop_usage_score * 100),
                    'api_discipline': min(100, behavior_metrics.exception_handling_score * 100),
                    'security_awareness': min(100, behavior_metrics.assertion_usage * 100)
                },
                'planet_evolution': {
                    'evolution_points': session['edit_count'],
                    'terrain_changes': self._calculate_terrain_changes(behavior_metrics),
                    'atmosphere_shifts': self._calculate_atmosphere_changes(behavior_metrics)
                }
            }
            
            # Cache result for real-time frontend updates
            await self.redis.publish(
                f"user_stream:{session['user_id']}",
                json.dumps(analysis_result)
            )
            
            # Add to processing queue for ML analysis
            await self.message_queue.put({
                'type': 'behavior_analysis',
                'session_id': session_id,
                'user_id': session['user_id'],
                'metrics': behavior_metrics,
                'session_data': session
            })
            
            logger.debug(f"📊 Analyzed code stream for session {session_id}")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error processing code stream: {e}")
            raise
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End a coding session and generate final analysis"""
        
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        
        # Calculate session summary
        duration = time.time() - session['start_time']
        
        session_summary = {
            'session_id': session_id,
            'user_id': session['user_id'],
            'duration_seconds': int(duration),
            'edit_count': session['edit_count'],
            'total_characters': session['total_characters'],
            'language': session['language'],
            'behavior_samples_count': len(session['behavior_samples']),
            'typing_speed_estimate': session['total_characters'] / max(duration / 60, 1),  # chars per minute
            'edit_frequency': session['edit_count'] / max(duration / 60, 1)  # edits per minute
        }
        
        # Store session in database
        db = SessionLocal()
        try:
            db_session = CodeSession(
                user_id=session['user_id'],
                language=session['language'],
                duration_seconds=int(duration),
                code_length=session['total_characters'],
                behavior_fingerprint=str(hash(str(session['behavior_samples']))),
                genome_generated=True  # Will be updated by genome lab
            )
            db.add(db_session)
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to save session to database: {e}")
            db.rollback()
        finally:
            db.close()
        
        # Trigger ML genome generation
        await self.message_queue.put({
            'type': 'session_complete',
            'session_id': session_id,
            'user_id': session['user_id'],
            'session_summary': session_summary,
            'behavior_samples': session['behavior_samples']
        })
        
        # Cleanup
        del self.active_sessions[session_id]
        await self.redis.delete(f"session:{session_id}")
        
        logger.info(f"✅ Ended coding session {session_id}")
        
        return session_summary
    
    def _calculate_terrain_changes(self, metrics: CodingBehaviorMetrics) -> List[str]:
        """Calculate potential terrain changes based on behavior"""
        changes = []
        
        if metrics.function_complexity_avg > 5:
            changes.append("mountain_peaks_forming")
        if metrics.code_reuse_score > 0.7:
            changes.append("forest_growth")
        if metrics.exception_handling_score > 0.8:
            changes.append("defensive_walls")
        if metrics.comment_ratio > 0.3:
            changes.append("knowledge_crystals")
            
        return changes
    
    def _calculate_atmosphere_changes(self, metrics: CodingBehaviorMetrics) -> List[str]:
        """Calculate atmospheric changes based on behavior"""
        changes = []
        
        if metrics.typing_speed_estimate > 60:
            changes.append("energetic_aurora")
        if metrics.indentation_consistency > 0.9:
            changes.append("clarity_mist")
        if metrics.revision_frequency < 2:
            changes.append("confidence_glow")
            
        return changes
    
    async def _process_message_queue(self):
        """Background task to process ML analysis queue"""
        while self.running:
            try:
                # Wait for messages with timeout
                message = await asyncio.wait_for(self.message_queue.get(), timeout=1.0)
                
                if message['type'] == 'behavior_analysis':
                    # Trigger real-time planet updates
                    await self._trigger_planet_evolution(message)
                    
                elif message['type'] == 'session_complete':
                    # Trigger comprehensive genome analysis
                    await self._trigger_genome_generation(message)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing message queue: {e}")
    
    async def _trigger_planet_evolution(self, message: Dict):
        """Trigger real-time planet evolution updates"""
        try:
            # Publish planet evolution event
            evolution_event = {
                'user_id': message['user_id'],
                'type': 'real_time_evolution',
                'changes': {
                    'terrain': self._calculate_terrain_changes(message['metrics']),
                    'atmosphere': self._calculate_atmosphere_changes(message['metrics'])
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
            await self.redis.publish(
                f"planet_evolution:{message['user_id']}",
                json.dumps(evolution_event)
            )
            
        except Exception as e:
            logger.error(f"Failed to trigger planet evolution: {e}")
    
    async def _trigger_genome_generation(self, message: Dict):
        """Trigger comprehensive genome generation after session"""
        try:
            # This would integrate with the ML Genome Lab
            genome_request = {
                'user_id': message['user_id'],
                'session_summary': message['session_summary'],
                'behavior_samples': message['behavior_samples'],
                'timestamp': datetime.utcnow().isoformat()
            }
            
            await self.redis.publish(
                f"genome_generation:{message['user_id']}",
                json.dumps(genome_request)
            )
            
            logger.info(f"🧬 Triggered genome generation for user {message['user_id']}")
            
        except Exception as e:
            logger.error(f"Failed to trigger genome generation: {e}")