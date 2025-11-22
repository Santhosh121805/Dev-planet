#!/usr/bin/env python3
"""
Planet API routes for Planet Code Forge
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import json

from ..models.database import User, Planet, PlanetType, EvolutionStage
from ..api.auth import get_current_user

planet_router = APIRouter()

class PlanetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    planet_type: Optional[PlanetType] = PlanetType.TERRESTRIAL

class PlanetResponse(BaseModel):
    id: str
    name: str
    planet_type: PlanetType
    evolution_stage: EvolutionStage
    atmosphere: str
    terrain: str
    primary_color: str
    secondary_color: str
    
    # Skills
    algorithm_mastery: float
    web_development_skill: float
    api_design_discipline: float
    devops_maturity: float
    security_awareness: float
    
    # Stats
    evolution_points: int
    total_code_time: int
    last_activity: datetime
    created_at: datetime
    
    # Visual
    visual_preview_url: Optional[str] = None

class PlanetStats(BaseModel):
    total_sessions: int
    avg_session_duration: float
    dominant_language: str
    skill_progression: Dict[str, List[float]]
    recent_achievements: List[Dict[str, Any]]

class SkillUpdate(BaseModel):
    algorithm_mastery: Optional[float] = None
    web_development_skill: Optional[float] = None
    api_design_discipline: Optional[float] = None
    devops_maturity: Optional[float] = None
    security_awareness: Optional[float] = None

@planet_router.get("/", response_model=List[PlanetResponse])
async def get_user_planets(current_user: User = Depends(get_current_user)):
    """
    Get all planets owned by current user
    """
    try:
        # TODO: Fetch from database
        # For now, return mock data
        mock_planet = PlanetResponse(
            id=str(uuid.uuid4()),
            name="Algorithmic Nexus",
            planet_type=PlanetType.CHAOTIC,
            evolution_stage=EvolutionStage.YOUNG_WORLD,
            atmosphere="neon",
            terrain="crystalline_formations",
            primary_color="#6366f1",
            secondary_color="#8b5cf6",
            algorithm_mastery=67.0,
            web_development_skill=45.0,
            api_design_discipline=23.0,
            devops_maturity=12.0,
            security_awareness=8.0,
            evolution_points=348,
            total_code_time=1240,
            last_activity=datetime.utcnow(),
            created_at=datetime.utcnow(),
            visual_preview_url="/api/v1/planet/visual/preview"
        )
        
        return [mock_planet]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch planets: {str(e)}"
        )

@planet_router.post("/", response_model=PlanetResponse)
async def create_planet(
    planet_data: PlanetCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new planet for the user
    """
    try:
        # TODO: Check if user already has a planet (one planet per user initially)
        # TODO: Generate planet characteristics based on initial code analysis
        # TODO: Save to database
        
        # For now, return mock created planet
        new_planet = PlanetResponse(
            id=str(uuid.uuid4()),
            name=planet_data.name,
            planet_type=planet_data.planet_type,
            evolution_stage=EvolutionStage.PROTOPLANET,
            atmosphere="clear",
            terrain="rocky",
            primary_color="#3b82f6",
            secondary_color="#1d4ed8",
            algorithm_mastery=0.0,
            web_development_skill=0.0,
            api_design_discipline=0.0,
            devops_maturity=0.0,
            security_awareness=0.0,
            evolution_points=0,
            total_code_time=0,
            last_activity=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        
        return new_planet
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create planet: {str(e)}"
        )

@planet_router.get("/{planet_id}", response_model=PlanetResponse)
async def get_planet(
    planet_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get specific planet details
    """
    try:
        # TODO: Fetch from database and verify ownership
        
        # Return mock planet data
        return PlanetResponse(
            id=planet_id,
            name="Algorithmic Nexus",
            planet_type=PlanetType.CHAOTIC,
            evolution_stage=EvolutionStage.YOUNG_WORLD,
            atmosphere="neon",
            terrain="crystalline_formations", 
            primary_color="#6366f1",
            secondary_color="#8b5cf6",
            algorithm_mastery=67.0,
            web_development_skill=45.0,
            api_design_discipline=23.0,
            devops_maturity=12.0,
            security_awareness=8.0,
            evolution_points=348,
            total_code_time=1240,
            last_activity=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch planet: {str(e)}"
        )

@planet_router.get("/{planet_id}/stats", response_model=PlanetStats)
async def get_planet_stats(
    planet_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed planet statistics and progression
    """
    try:
        # TODO: Calculate real stats from database
        
        return PlanetStats(
            total_sessions=42,
            avg_session_duration=28.5,
            dominant_language="Python",
            skill_progression={
                "algorithm_mastery": [0, 15, 35, 52, 67],
                "web_development_skill": [0, 8, 22, 35, 45],
                "api_design_discipline": [0, 3, 12, 18, 23]
            },
            recent_achievements=[
                {
                    "id": "perfectionist",
                    "title": "The Perfectionist",
                    "points": 100,
                    "unlocked_at": "2025-11-22T10:30:00Z"
                },
                {
                    "id": "comment_poet",
                    "title": "Comment Poet",
                    "points": 50,
                    "unlocked_at": "2025-11-22T09:15:00Z"
                }
            ]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch planet stats: {str(e)}"
        )

@planet_router.put("/{planet_id}/skills")
async def update_planet_skills(
    planet_id: str,
    skills: SkillUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update planet skills based on code analysis
    This is typically called by the ML analysis service
    """
    try:
        # TODO: Verify ownership and update database
        # TODO: Check for skill level ups and evolution triggers
        # TODO: Award achievements if thresholds are met
        
        return {
            "updated": True,
            "planet_id": planet_id,
            "evolution_points_earned": 25,
            "achievements_unlocked": []
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update skills: {str(e)}"
        )

@planet_router.get("/{planet_id}/visual")
async def get_planet_visual(
    planet_id: str,
    format: str = "svg",
    size: int = 512
):
    """
    Generate or retrieve planet visual representation
    """
    try:
        # TODO: Generate visual based on planet characteristics
        # TODO: Cache generated visuals
        
        if format == "svg":
            # Return SVG planet visualization
            svg_content = f"""
            <svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="planetGrad" cx="30%" cy="30%">
                        <stop offset="0%" stop-color="#6366f1" />
                        <stop offset="100%" stop-color="#1d4ed8" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="{size//2}" cy="{size//2}" r="{size//2-20}" 
                        fill="url(#planetGrad)" filter="url(#glow)" />
                <circle cx="{size//2-80}" cy="{size//2-40}" r="8" fill="#8b5cf6" opacity="0.7" />
                <circle cx="{size//2+60}" cy="{size//2+30}" r="12" fill="#a855f7" opacity="0.5" />
            </svg>
            """
            return {"content": svg_content, "format": "svg"}
        
        return {"message": "Planet visual generated", "format": format}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate visual: {str(e)}"
        )