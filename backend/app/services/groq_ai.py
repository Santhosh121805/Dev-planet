#!/usr/bin/env python3
"""
Groq AI Service for Planet Code Forge
High-speed AI inference for code analysis and planet generation
"""

import asyncio
from typing import Dict, List, Any, Optional
import json
import httpx
from loguru import logger
import time

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from config import load_config

config = load_config()

class GroqAIService:
    """Service for Groq API integration"""
    
    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model = config.GROQ_MODEL
        self.base_url = config.GROQ_BASE_URL
        self.client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize the Groq service"""
        if not self.api_key:
            logger.warning("⚠️  Groq API key not provided. AI analysis will use fallback methods.")
            return False
            
        try:
            self.client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            # Test connection
            await self._test_connection()
            self._initialized = True
            logger.success("✅ Groq AI Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Groq service: {e}")
            return False
    
    async def _test_connection(self):
        """Test Groq API connection"""
        try:
            response = await self.client.post("/chat/completions", json={
                "model": self.model,
                "messages": [{"role": "user", "content": "Test connection"}],
                "max_tokens": 10
            })
            response.raise_for_status()
            logger.info("🚀 Groq API connection successful")
        except Exception as e:
            raise Exception(f"Groq API connection failed: {e}")
    
    async def test_connection(self) -> bool:
        """Public method to test connection"""
        try:
            await self._test_connection()
            return True
        except Exception as e:
            logger.warning(f"Connection test failed: {e}")
            return False
    
    async def analyze_code_behavior(self, code_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze coding behavior using Groq AI"""
        
        if not self._initialized:
            return self._fallback_analysis(code_metrics)
        
        try:
            start_time = time.time()
            
            # Create prompt for code behavior analysis
            prompt = self._create_analysis_prompt(code_metrics)
            
            response = await self.client.post("/chat/completions", json={
                "model": self.model,
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a code behavior analyst. Analyze coding patterns and return JSON only."
                    },
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1000,
                "temperature": 0.3
            })
            
            response.raise_for_status()
            result = response.json()
            
            # Extract and parse the AI response
            analysis = self._parse_ai_response(result)
            
            # Add performance metrics
            analysis["ai_analysis_time_ms"] = int((time.time() - start_time) * 1000)
            analysis["model_used"] = self.model
            
            logger.info(f"🧠 Groq analysis completed in {analysis['ai_analysis_time_ms']}ms")
            return analysis
            
        except Exception as e:
            logger.error(f"Groq analysis failed: {e}")
            return self._fallback_analysis(code_metrics)
    
    def _create_analysis_prompt(self, metrics: Dict[str, Any]) -> str:
        """Create analysis prompt for Groq"""
        
        prompt = f"""
Analyze this coding session and provide insights:

Code Metrics:
- Lines of code: {metrics.get('lines', 0)}
- Functions created: {metrics.get('functions', 0)}
- Comments: {metrics.get('comments', 0)}
- Complexity score: {metrics.get('complexity', 1)}
- Language: {metrics.get('language', 'unknown')}
- Time spent: {metrics.get('duration_minutes', 0)} minutes
- Keystrokes: {metrics.get('keystrokes', 0)}

Return a JSON object with this exact structure:
{{
  "coding_style": "methodical|pragmatic|artistic|complex|minimal",
  "personality_traits": ["trait1", "trait2", "trait3"],
  "skill_assessment": {{
    "algorithm_mastery": 0.0-100.0,
    "web_development": 0.0-100.0,
    "api_design": 0.0-100.0,
    "devops_skills": 0.0-100.0,
    "security_awareness": 0.0-100.0
  }},
  "planet_characteristics": {{
    "atmosphere": "neon|crystalline|stormy|clear|toxic",
    "terrain": "rocky|liquid|crystalline|volcanic|metallic",
    "primary_color": "#hexcolor",
    "evolution_stage": "protoplanet|young_world|mature_planet|ancient_world"
  }},
  "achievements_earned": ["achievement_id1", "achievement_id2"],
  "insights": ["insight1", "insight2", "insight3"]
}}
"""
        return prompt
    
    def _parse_ai_response(self, response: Dict) -> Dict[str, Any]:
        """Parse Groq AI response"""
        
        try:
            content = response["choices"][0]["message"]["content"]
            
            # Extract JSON from response (handle markdown formatting)
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            
            analysis = json.loads(content)
            
            # Validate and normalize the response
            return self._normalize_analysis(analysis)
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            return self._fallback_analysis({})
    
    def _normalize_analysis(self, analysis: Dict) -> Dict[str, Any]:
        """Normalize AI analysis response"""
        
        normalized = {
            "coding_style": analysis.get("coding_style", "pragmatic"),
            "personality_traits": analysis.get("personality_traits", ["focused", "methodical"]),
            "skill_deltas": {
                "algorithm_mastery": min(analysis.get("skill_assessment", {}).get("algorithm_mastery", 10.0) / 10, 5.0),
                "web_development_skill": min(analysis.get("skill_assessment", {}).get("web_development", 10.0) / 10, 5.0),
                "api_design_discipline": min(analysis.get("skill_assessment", {}).get("api_design", 10.0) / 10, 5.0),
                "devops_maturity": min(analysis.get("skill_assessment", {}).get("devops_skills", 10.0) / 10, 5.0),
                "security_awareness": min(analysis.get("skill_assessment", {}).get("security_awareness", 10.0) / 10, 5.0)
            },
            "planet_updates": analysis.get("planet_characteristics", {
                "atmosphere": "clear",
                "terrain": "rocky",
                "primary_color": "#3b82f6",
                "evolution_stage": "young_world"
            }),
            "achievements_earned": analysis.get("achievements_earned", []),
            "ai_insights": analysis.get("insights", ["Great coding session!"]),
            "evolution_points": sum([
                min(analysis.get("skill_assessment", {}).get("algorithm_mastery", 10.0) / 10, 5.0),
                min(analysis.get("skill_assessment", {}).get("web_development", 10.0) / 10, 5.0),
                min(analysis.get("skill_assessment", {}).get("api_design", 10.0) / 10, 5.0),
                min(analysis.get("skill_assessment", {}).get("devops_skills", 10.0) / 10, 5.0),
                min(analysis.get("skill_assessment", {}).get("security_awareness", 10.0) / 10, 5.0)
            ])
        }
        
        return normalized
    
    def _fallback_analysis(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when Groq is unavailable"""
        
        lines = metrics.get("lines", 0)
        functions = metrics.get("functions", 0)
        comments = metrics.get("comments", 0)
        complexity = metrics.get("complexity", 1)
        
        # Simple heuristic analysis
        comment_ratio = comments / max(lines, 1)
        function_density = functions / max(lines, 1)
        
        # Determine coding style
        if comment_ratio > 0.15:
            style = "methodical"
        elif function_density > 0.1:
            style = "modular"
        elif complexity > 5:
            style = "complex"
        else:
            style = "pragmatic"
        
        skill_gain = min(complexity * 0.5, 3.0)
        
        return {
            "coding_style": style,
            "personality_traits": ["focused", "analytical"],
            "skill_deltas": {
                "algorithm_mastery": skill_gain,
                "web_development_skill": skill_gain * 0.6,
                "api_design_discipline": skill_gain * 0.4,
                "devops_maturity": skill_gain * 0.3,
                "security_awareness": skill_gain * 0.2
            },
            "planet_updates": {
                "atmosphere": "clear",
                "terrain": "rocky",
                "primary_color": "#3b82f6",
                "evolution_stage": "young_world"
            },
            "achievements_earned": ["productive_session"] if skill_gain > 2.0 else [],
            "ai_insights": [f"Productive {style} coding session"],
            "evolution_points": skill_gain * 2,
            "analysis_method": "fallback_heuristic"
        }
    
    async def generate_planet_description(self, planet_data: Dict[str, Any]) -> str:
        """Generate planet description using Groq AI"""
        
        if not self._initialized:
            return f"A {planet_data.get('planet_type', 'mysterious')} planet with {planet_data.get('atmosphere', 'clear')} atmosphere."
        
        try:
            prompt = f"""
Create a poetic, inspiring description for a coding planet with these characteristics:
- Type: {planet_data.get('planet_type', 'terrestrial')}
- Atmosphere: {planet_data.get('atmosphere', 'clear')}
- Terrain: {planet_data.get('terrain', 'rocky')}
- Evolution Stage: {planet_data.get('evolution_stage', 'young_world')}
- Algorithm Mastery: {planet_data.get('algorithm_mastery', 0)}/100
- Web Development: {planet_data.get('web_development_skill', 0)}/100

Write 2-3 sentences that capture the essence of this coder's planet. Be creative and inspiring.
"""
            
            response = await self.client.post("/chat/completions", json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a cosmic poet describing unique coding planets."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 200,
                "temperature": 0.7
            })
            
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            logger.error(f"Failed to generate planet description: {e}")
            return f"A magnificent {planet_data.get('planet_type', 'world')} where code flows like cosmic rivers."
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.client:
            await self.client.aclose()
        logger.info("🧹 Groq AI Service cleaned up")

# Global service instance
groq_service = GroqAIService()