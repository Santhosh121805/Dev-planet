#!/usr/bin/env python3
"""
Planet API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from loguru import logger

from models.database import Planet, EvolutionEvent, User, SessionLocal
from api.auth import get_current_user
from services.planet_builder import PlanetBuilderAPI

router = APIRouter()

# Global planet builder instance (injected by main app)
planet_builder: PlanetBuilderAPI = None

# Pydantic models
class PlanetResponse(BaseModel):
    id: str
    name: str
    type: str
    visual_params: Dict[str, Any]
    atmosphere: str
    terrain: str
    skills: Dict[str, float]
    evolution: Dict[str, Any]
    personality: Dict[str, float]
    created_at: datetime
    updated_at: datetime

class EvolutionEventResponse(BaseModel):
    id: str
    event_type: str
    description: str
    points_earned: int
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

class PlanetUpdateRequest(BaseModel):
    genome_data: Dict[str, Any]

@router.get("/user/{user_id}", response_model=PlanetResponse)
async def get_user_planet(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a user's planet data"""
    
    # Users can only access their own planet unless admin
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        db = SessionLocal()
        try:
            planet = db.query(Planet).filter(Planet.user_id == user_id).first()
            
            if not planet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Planet not found"
                )
            
            planet_data = await planet_builder.get_planet_data(str(planet.id))
            
            return PlanetResponse(
                id=planet_data['id'],
                name=planet_data['name'],
                type=planet_data['type'],
                visual_params=planet_data['visual_params'],
                atmosphere=planet_data['atmosphere'],
                terrain=planet_data['terrain'],
                skills=planet_data['skills'],
                evolution=planet_data['evolution'],
                personality=planet_data['personality'],
                created_at=datetime.fromisoformat(planet_data['created_at']),
                updated_at=datetime.fromisoformat(planet_data['updated_at'])
            )
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get planet for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve planet data"
        )

@router.get("/me", response_model=PlanetResponse)
async def get_my_planet(current_user: User = Depends(get_current_user)):
    """Get current user's planet"""
    return await get_user_planet(str(current_user.id), current_user)

@router.put("/me", response_model=PlanetResponse)
async def update_my_planet(
    update_data: PlanetUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update current user's planet with new genome data"""
    
    try:
        user_id = str(current_user.id)
        
        # Check if planet exists
        db = SessionLocal()
        try:
            planet = db.query(Planet).filter(Planet.user_id == user_id).first()
            
            if planet:
                # Update existing planet
                planet_id = await planet_builder.update_planet(
                    str(planet.id), 
                    update_data.genome_data
                )
            else:
                # Create new planet
                planet_id = await planet_builder.create_planet(
                    user_id, 
                    update_data.genome_data
                )
            
        finally:
            db.close()
        
        # Return updated planet data
        planet_data = await planet_builder.get_planet_data(planet_id)
        
        return PlanetResponse(
            id=planet_data['id'],
            name=planet_data['name'],
            type=planet_data['type'],
            visual_params=planet_data['visual_params'],
            atmosphere=planet_data['atmosphere'],
            terrain=planet_data['terrain'],
            skills=planet_data['skills'],
            evolution=planet_data['evolution'],
            personality=planet_data['personality'],
            created_at=datetime.fromisoformat(planet_data['created_at']),
            updated_at=datetime.fromisoformat(planet_data['updated_at'])
        )
        
    except Exception as e:
        logger.error(f"Failed to update planet for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update planet"
        )

@router.get("/me/evolution", response_model=List[EvolutionEventResponse])
async def get_my_evolution_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get evolution history for current user's planet"""
    
    try:
        db = SessionLocal()
        try:
            # Get user's planet
            planet = db.query(Planet).filter(Planet.user_id == str(current_user.id)).first()
            
            if not planet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Planet not found"
                )
            
            # Get evolution events
            events = (
                db.query(EvolutionEvent)
                .filter(EvolutionEvent.planet_id == planet.id)
                .order_by(EvolutionEvent.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            return [
                EvolutionEventResponse(
                    id=str(event.id),
                    event_type=event.event_type,
                    description=event.description,
                    points_earned=event.points_earned,
                    metadata=event.metadata,
                    created_at=event.created_at
                )
                for event in events
            ]
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get evolution history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve evolution history"
        )

@router.get("/gallery", response_model=List[PlanetResponse])
async def get_planet_gallery(
    limit: int = 20,
    offset: int = 0,
    planet_type: Optional[str] = None
):
    """Get public planet gallery (anonymized)"""
    
    try:
        db = SessionLocal()
        try:
            query = db.query(Planet)
            
            if planet_type:
                query = query.filter(Planet.planet_type == planet_type)
            
            planets = (
                query
                .order_by(Planet.evolution_points.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            gallery_planets = []
            for planet in planets:
                planet_data = await planet_builder.get_planet_data(str(planet.id))
                
                # Remove user-identifying information
                planet_data.pop('user_id', None)
                
                gallery_planets.append(PlanetResponse(
                    id=planet_data['id'],
                    name=planet_data['name'],
                    type=planet_data['type'],
                    visual_params=planet_data['visual_params'],
                    atmosphere=planet_data['atmosphere'],
                    terrain=planet_data['terrain'],
                    skills=planet_data['skills'],
                    evolution=planet_data['evolution'],
                    personality=planet_data['personality'],
                    created_at=datetime.fromisoformat(planet_data['created_at']),
                    updated_at=datetime.fromisoformat(planet_data['updated_at'])
                ))
            
            return gallery_planets
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to get planet gallery: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve planet gallery"
        )

@router.get("/stats")
async def get_planet_stats():
    """Get platform-wide planet statistics"""
    
    try:
        db = SessionLocal()
        try:
            total_planets = db.query(Planet).count()
            
            # Planet type distribution
            type_stats = (
                db.query(Planet.planet_type, db.func.count(Planet.id))
                .group_by(Planet.planet_type)
                .all()
            )
            
            # Evolution stage distribution
            stage_stats = (
                db.query(Planet.evolution_stage, db.func.count(Planet.id))
                .group_by(Planet.evolution_stage)
                .all()
            )
            
            return {
                'total_planets': total_planets,
                'planet_types': dict(type_stats),
                'evolution_stages': dict(stage_stats),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to get planet stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve planet statistics"
        )