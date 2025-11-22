#!/usr/bin/env python3
"""
Genome Lab ML Engine
Powered by Groq AI for fast behavioral analysis
"""

import asyncio
from typing import Dict, Any, List
from loguru import logger

from .groq_ai import groq_service

class GenomeLabEngine:
    """ML engine for coding genome analysis"""
    
    def __init__(self):
        self.ready = False
        self.models = {}
        
    async def initialize(self):
        """Initialize ML models"""
        logger.info("🧬 Initializing Genome Lab ML Engine...")
        
        try:
            # Initialize Groq AI service
            await groq_service.initialize()
            
            self.models = {
                "groq_ai": groq_service,
                "behavioral_analyzer": "groq_powered",
                "skill_estimator": "groq_powered", 
                "style_classifier": "groq_powered"
            }
            
            self.ready = True
            logger.success("✅ Genome Lab ML Engine ready with Groq AI")
            
        except Exception as e:
            logger.error(f"Failed to initialize Genome Lab: {e}")
            # Use fallback methods
            self.ready = True
            logger.warning("⚠️  Using fallback analysis methods")
        
    async def cleanup(self):
        """Cleanup resources"""
        await groq_service.cleanup()
        self.ready = False
        logger.info("🧹 Genome Lab ML Engine cleaned up")
        
    def is_ready(self) -> bool:
        """Check if engine is ready"""
        return self.ready
    
    async def start(self):
        """Start the engine (alias for initialize)"""
        await self.initialize()
    
    async def stop(self):
        """Stop the engine (alias for cleanup)"""
        await self.cleanup()
    
    def is_active(self) -> bool:
        """Check if engine is active (alias for is_ready)"""
        return self.is_ready()
        
    async def analyze_coding_genome(self, behavioral_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze coding genome from behavioral patterns using Groq AI"""
        
        if not self.ready:
            raise Exception("Genome Lab engine not ready")
            
        try:
            # Use Groq AI for advanced analysis
            analysis = await groq_service.analyze_code_behavior(behavioral_data)
            
            # Extract genome-specific insights
            genome_analysis = {
                "primary_archetype": self._determine_archetype(analysis),
                "coding_style": analysis.get("coding_style", "pragmatic"),
                "skill_affinities": self._calculate_skill_affinities(analysis),
                "learning_velocity": self._calculate_learning_velocity(analysis),
                "complexity_preference": self._assess_complexity_preference(behavioral_data),
                "personality_traits": analysis.get("personality_traits", ["focused"]),
                "evolution_potential": analysis.get("evolution_points", 0),
                "ai_insights": analysis.get("ai_insights", [])
            }
            
            return {"genome_analysis": genome_analysis}
            
        except Exception as e:
            logger.error(f"Groq genome analysis failed: {e}")
            return self._fallback_genome_analysis(behavioral_data)
    
    def _determine_archetype(self, analysis: Dict[str, Any]) -> str:
        """Determine coding archetype from analysis"""
        
        style = analysis.get("coding_style", "pragmatic")
        traits = analysis.get("personality_traits", [])
        
        archetype_map = {
            "methodical": "The Architect",
            "pragmatic": "The Builder", 
            "artistic": "The Visionary",
            "complex": "The Explorer",
            "minimal": "The Zen Master"
        }
        
        return archetype_map.get(style, "The Builder")
    
    def _calculate_skill_affinities(self, analysis: Dict[str, Any]) -> Dict[str, float]:
        """Calculate skill affinities from analysis"""
        
        skills = analysis.get("skill_deltas", {})
        
        return {
            "algorithms": min(skills.get("algorithm_mastery", 0) / 5.0, 1.0),
            "systems": min(skills.get("api_design_discipline", 0) / 5.0, 1.0),
            "ui": min(skills.get("web_development_skill", 0) / 5.0, 1.0),
            "devops": min(skills.get("devops_maturity", 0) / 5.0, 1.0),
            "security": min(skills.get("security_awareness", 0) / 5.0, 1.0)
        }
    
    def _calculate_learning_velocity(self, analysis: Dict[str, Any]) -> float:
        """Calculate learning velocity"""
        
        evolution_points = analysis.get("evolution_points", 0)
        return min(evolution_points / 10.0, 1.0)
    
    def _assess_complexity_preference(self, behavioral_data: Dict[str, Any]) -> str:
        """Assess complexity preference"""
        
        complexity = behavioral_data.get("complexity", 1)
        
        if complexity > 8:
            return "high"
        elif complexity > 4:
            return "moderate_to_high"
        else:
            return "simple_solutions"
    
    def _fallback_genome_analysis(self, behavioral_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when Groq is unavailable"""
        
        return {
            "genome_analysis": {
                "primary_archetype": "The Builder",
                "coding_style": "pragmatic",
                "skill_affinities": {
                    "algorithms": 0.6,
                    "systems": 0.5,
                    "ui": 0.4,
                    "devops": 0.3,
                    "security": 0.3
                },
                "learning_velocity": 0.5,
                "complexity_preference": "moderate",
                "personality_traits": ["focused", "methodical"],
                "evolution_potential": 5.0,
                "analysis_method": "fallback_heuristic"
            }
        }

# Global instance
genome_lab_engine = GenomeLabEngine()