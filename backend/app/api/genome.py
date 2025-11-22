#!/usr/bin/env python3
"""
Genome analysis API routes for Planet Code Forge
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

from ..api.auth import get_current_user
from ..models.database import User

genome_router = APIRouter()

class GenomeAnalysis(BaseModel):
    user_id: str
    coding_dna: Dict[str, float]
    personality_traits: Dict[str, str]
    skill_distribution: Dict[str, float]
    learning_velocity: float
    dominant_patterns: List[str]

@genome_router.post("/analyze")
async def analyze_code_genome(request: dict):
    """Analyze coding genome from behavioral patterns - No auth required for demo"""
    
    code = request.get("code", "")
    language = request.get("language", "unknown")
    metrics = request.get("metrics", {})
    
    # Real-time code analysis logic
    lines = len(code.split('\n')) if code else 0
    code_length = len(code)
    
    # Pattern detection
    has_functions = 'function' in code or 'def ' in code or '=>' in code
    has_classes = 'class ' in code
    has_comments = '//' in code or '#' in code or '/*' in code
    has_error_handling = 'try' in code or 'catch' in code or 'except' in code
    has_async = 'async' in code or 'await' in code or 'Promise' in code
    has_optimization = 'for' in code or 'while' in code or 'map' in code
    
    # Calculate scores
    base_points = min(50, max(1, code_length // 10))
    complexity_bonus = 0
    
    if has_functions:
        complexity_bonus += 15
    if has_classes:
        complexity_bonus += 20
    if has_comments:
        complexity_bonus += 10
    if has_error_handling:
        complexity_bonus += 25
    if has_async:
        complexity_bonus += 15
    if has_optimization:
        complexity_bonus += 12
    
    evolution_points = min(100, base_points + complexity_bonus)
    complexity_score = min(10, max(1, (evolution_points // 10) + (lines // 5)))
    
    # Generate style feedback
    if code_length == 0:
        style_feedback = "awaiting-code"
    elif code_length < 50:
        style_feedback = "getting-started"
    elif has_functions and has_comments:
        style_feedback = "well-structured"
    elif has_error_handling:
        style_feedback = "robust-design"
    elif has_classes:
        style_feedback = "object-oriented"
    else:
        style_feedback = "developing"
    
    # Generate intelligent suggestions
    suggestions = []
    if code_length == 0:
        suggestions = ["🚀 Ready for real-time API analysis! Start coding..."]
    else:
        suggestions.append(f"✨ Backend analysis complete for {language}")
        
        if evolution_points > 50:
            suggestions.append("🌟 Excellent coding patterns detected!")
        if has_functions:
            suggestions.append("🔧 Great function structure!")
        if has_comments:
            suggestions.append("📝 Well documented code!")
        if has_error_handling:
            suggestions.append("🛡️ Robust error handling!")
        if has_async:
            suggestions.append("⚡ Modern async patterns!")
        if lines > 20:
            suggestions.append("📏 Substantial implementation!")
            
        if len(suggestions) == 1:  # Only base message
            suggestions.append("💡 Keep coding to unlock more insights!")
    
    return {
        "evolution_points": evolution_points,
        "complexity_score": complexity_score,
        "style_feedback": style_feedback,
        "suggestions": suggestions,
        "quality": "excellent" if evolution_points > 70 else "good" if evolution_points > 30 else "developing",
        "analysis_source": "planet_forge_api",
        "timestamp": datetime.utcnow().isoformat()
    }

@genome_router.get("/{user_id}")
async def get_genome_profile(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user's coding genome profile"""
    
    # TODO: Fetch from ML analysis results
    return GenomeAnalysis(
        user_id=user_id,
        coding_dna={
            "algorithm_affinity": 0.8,
            "ui_creativity": 0.6,
            "system_thinking": 0.7,
            "code_artistry": 0.5
        },
        personality_traits={
            "primary": "Architect",
            "secondary": "Perfectionist",
            "learning_style": "Deep Diver"
        },
        skill_distribution={
            "backend": 0.7,
            "frontend": 0.4,
            "devops": 0.3,
            "ml": 0.6
        },
        learning_velocity=0.85,
        dominant_patterns=["methodical_naming", "comprehensive_testing", "detailed_comments"]
    )