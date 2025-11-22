#!/usr/bin/env python3
"""
Planet Builder API - Generates and updates planet data from code genomes
"""

import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import asdict
from datetime import datetime, timedelta
import json
from loguru import logger
import aioredis

from models.database import Planet, EvolutionEvent, User, SessionLocal
from config import config

class PlanetBuilderAPI:
    """Service for building and evolving user planets"""
    
    def __init__(self):
        self.redis = None
        self.active = False
        
    async def start(self):
        """Initialize the planet builder service"""
        try:
            self.redis = aioredis.from_url(config.redis_url)
            self.active = True
            
            # Start background evolution processor
            asyncio.create_task(self._evolution_processor())
            
            logger.info("🏗️  Planet Builder API started")
            
        except Exception as e:
            logger.error(f"Failed to start Planet Builder: {e}")
            raise
    
    async def stop(self):
        """Stop the planet builder service"""
        self.active = False
        
        if self.redis:
            await self.redis.close()
        
        logger.info("🛑 Planet Builder API stopped")
    
    def is_active(self) -> bool:
        return self.active
    
    async def create_planet(self, user_id: str, genome_data: Dict) -> str:
        """Create a new planet for a user based on their code genome"""
        
        db = SessionLocal()
        try:
            # Check if user already has a planet
            existing_planet = db.query(Planet).filter(Planet.user_id == user_id).first()
            if existing_planet:
                return await self.update_planet(str(existing_planet.id), genome_data)
            
            # Generate unique planet name
            planet_name = self._generate_planet_name(genome_data)
            
            # Create visual parameters
            visual_params = self._generate_visual_params(genome_data)
            
            # Create new planet
            planet = Planet(
                user_id=user_id,
                name=planet_name,
                planet_type=genome_data.get('planet_type', 'unknown'),
                visual_params=visual_params,
                atmosphere=genome_data.get('atmosphere', 'neutral'),
                terrain=genome_data.get('terrain', 'plains'),
                
                # Skill levels
                algorithm_mastery=genome_data.get('algorithm_mastery', 0),
                web_development_skill=genome_data.get('web_development_skill', 0),
                api_design_discipline=genome_data.get('api_design_discipline', 0),
                devops_maturity=genome_data.get('devops_maturity', 0),
                security_awareness=genome_data.get('security_awareness', 0),
                
                # Evolution data
                evolution_stage=genome_data.get('evolution_stage', 'proto_planet'),
                learning_velocity=genome_data.get('learning_velocity', 0.5),
                exploration_tendency=genome_data.get('exploration_tendency', 0.5),
                
                # Personality traits
                code_elegance=genome_data.get('code_elegance', 0.5),
                innovation_drive=genome_data.get('innovation_drive', 0.5),
                collaboration_style=genome_data.get('collaboration_style', 0.5),
                problem_solving_approach=genome_data.get('problem_solving_approach', 0.5)
            )
            
            db.add(planet)
            db.commit()
            db.refresh(planet)
            
            # Create initial evolution event
            evolution_event = EvolutionEvent(
                planet_id=planet.id,
                event_type="planet_birth",
                description=f"Planet {planet_name} was born from coding behavior analysis",
                metadata=genome_data,
                new_state=asdict(planet) if hasattr(planet, '__dict__') else {},
                points_earned=10
            )
            
            db.add(evolution_event)
            db.commit()
            
            # Cache planet data
            await self.redis.setex(
                f"planet:{planet.id}",
                3600,  # 1 hour cache
                json.dumps({
                    'id': str(planet.id),
                    'name': planet.name,
                    'type': planet.planet_type,
                    'visual_params': visual_params,
                    'skills': {
                        'algorithm': planet.algorithm_mastery,
                        'web': planet.web_development_skill,
                        'api': planet.api_design_discipline,
                        'devops': planet.devops_maturity,
                        'security': planet.security_awareness
                    },
                    'evolution': {
                        'stage': planet.evolution_stage,
                        'points': planet.evolution_points,
                        'velocity': planet.learning_velocity
                    }
                })
            )
            
            logger.info(f"🌍 Created planet {planet_name} for user {user_id}")
            
            return str(planet.id)
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create planet: {e}")
            raise
        finally:
            db.close()
    
    async def update_planet(self, planet_id: str, genome_data: Dict) -> str:
        """Update an existing planet with new genome data"""
        
        db = SessionLocal()
        try:
            planet = db.query(Planet).filter(Planet.id == planet_id).first()
            if not planet:
                raise ValueError(f"Planet {planet_id} not found")
            
            # Store previous state for evolution tracking
            previous_state = {
                'skills': {
                    'algorithm': planet.algorithm_mastery,
                    'web': planet.web_development_skill,
                    'api': planet.api_design_discipline,
                    'devops': planet.devops_maturity,
                    'security': planet.security_awareness
                },
                'evolution_stage': planet.evolution_stage,
                'evolution_points': planet.evolution_points
            }
            
            # Update planet with new data
            skill_changes = self._calculate_skill_changes(planet, genome_data)
            
            planet.algorithm_mastery = max(planet.algorithm_mastery, genome_data.get('algorithm_mastery', 0))
            planet.web_development_skill = max(planet.web_development_skill, genome_data.get('web_development_skill', 0))
            planet.api_design_discipline = max(planet.api_design_discipline, genome_data.get('api_design_discipline', 0))
            planet.devops_maturity = max(planet.devops_maturity, genome_data.get('devops_maturity', 0))
            planet.security_awareness = max(planet.security_awareness, genome_data.get('security_awareness', 0))
            
            # Update evolution data
            planet.learning_velocity = genome_data.get('learning_velocity', planet.learning_velocity)
            planet.exploration_tendency = genome_data.get('exploration_tendency', planet.exploration_tendency)
            
            # Check for evolution stage upgrade
            new_stage = self._calculate_evolution_stage(planet)
            stage_changed = new_stage != planet.evolution_stage
            planet.evolution_stage = new_stage
            
            # Award evolution points for improvements
            points_earned = self._calculate_evolution_points(skill_changes, stage_changed)
            planet.evolution_points += points_earned
            
            # Update visual parameters if significant changes
            if sum(skill_changes.values()) > 5 or stage_changed:
                planet.visual_params = self._generate_visual_params(genome_data)
            
            db.commit()
            db.refresh(planet)
            
            # Create evolution event
            if points_earned > 0:
                evolution_event = EvolutionEvent(
                    planet_id=planet.id,
                    event_type="skill_evolution" if not stage_changed else "stage_evolution",
                    description=self._generate_evolution_description(skill_changes, stage_changed, new_stage),
                    metadata={
                        'skill_changes': skill_changes,
                        'stage_changed': stage_changed,
                        'new_stage': new_stage,
                        'genome_data': genome_data
                    },
                    previous_state=previous_state,
                    new_state={
                        'skills': {
                            'algorithm': planet.algorithm_mastery,
                            'web': planet.web_development_skill,
                            'api': planet.api_design_discipline,
                            'devops': planet.devops_maturity,
                            'security': planet.security_awareness
                        },
                        'evolution_stage': planet.evolution_stage,
                        'evolution_points': planet.evolution_points
                    },
                    points_earned=points_earned
                )
                
                db.add(evolution_event)
                db.commit()
                
                # Publish evolution event
                await self.redis.publish(
                    f"planet_evolution:{planet.user_id}",
                    json.dumps({
                        'planet_id': str(planet.id),
                        'event_type': evolution_event.event_type,
                        'description': evolution_event.description,
                        'points_earned': points_earned,
                        'new_stage': new_stage if stage_changed else None,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                )
            
            # Update cache
            await self._update_planet_cache(planet)
            
            logger.info(f"🔄 Updated planet {planet.name} - earned {points_earned} points")
            
            return str(planet.id)
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update planet: {e}")
            raise
        finally:
            db.close()
    
    async def get_planet_data(self, planet_id: str) -> Dict[str, Any]:
        """Get complete planet data for frontend"""
        
        # Try cache first
        cached_data = await self.redis.get(f"planet:{planet_id}")
        if cached_data:
            return json.loads(cached_data)
        
        # Fetch from database
        db = SessionLocal()
        try:
            planet = db.query(Planet).filter(Planet.id == planet_id).first()
            if not planet:
                raise ValueError(f"Planet {planet_id} not found")
            
            planet_data = {
                'id': str(planet.id),
                'user_id': str(planet.user_id),
                'name': planet.name,
                'type': planet.planet_type,
                'visual_params': planet.visual_params,
                'atmosphere': planet.atmosphere,
                'terrain': planet.terrain,
                'skills': {
                    'algorithm': planet.algorithm_mastery,
                    'web': planet.web_development_skill,
                    'api': planet.api_design_discipline,
                    'devops': planet.devops_maturity,
                    'security': planet.security_awareness
                },
                'evolution': {
                    'stage': planet.evolution_stage,
                    'points': planet.evolution_points,
                    'velocity': planet.learning_velocity,
                    'exploration': planet.exploration_tendency
                },
                'personality': {
                    'elegance': planet.code_elegance,
                    'innovation': planet.innovation_drive,
                    'collaboration': planet.collaboration_style,
                    'problem_solving': planet.problem_solving_approach
                },
                'created_at': planet.created_at.isoformat(),
                'updated_at': planet.updated_at.isoformat()
            }
            
            # Cache the data
            await self.redis.setex(
                f"planet:{planet_id}",
                3600,
                json.dumps(planet_data)
            )
            
            return planet_data
            
        finally:
            db.close()
    
    def _generate_planet_name(self, genome_data: Dict) -> str:
        """Generate unique planet name based on genome"""
        planet_type = genome_data.get('planet_type', 'unknown')
        atmosphere = genome_data.get('atmosphere', 'neutral')
        
        name_parts = {
            'minimalist': ['Zen', 'Pure', 'Clean', 'Simple'],
            'chaotic': ['Storm', 'Flux', 'Wild', 'Chaos'],
            'structured': ['Order', 'Logic', 'System', 'Grid'],
            'creative': ['Dream', 'Vision', 'Color', 'Art'],
            'analytical': ['Mind', 'Data', 'Logic', 'Calc']
        }
        
        suffixes = {
            'calm': ['Prime', 'Core', 'Haven', 'Rest'],
            'energetic': ['Burst', 'Rush', 'Spark', 'Blaze'],
            'focused': ['Point', 'Beam', 'Lock', 'Sharp'],
            'experimental': ['Lab', 'Test', 'Try', 'Explore']
        }
        
        prefix = name_parts.get(planet_type, ['Planet'])[hash(genome_data.get('user_id', '')) % 4]
        suffix = suffixes.get(atmosphere, ['World'])[hash(str(genome_data.values())) % 4]
        
        return f"{prefix}{suffix}"
    
    def _generate_visual_params(self, genome_data: Dict) -> Dict[str, Any]:
        """Generate visual parameters for planet rendering"""
        # This would map genome data to visual properties for the frontend
        return {
            'size': min(100, max(20, sum([
                genome_data.get('algorithm_mastery', 0),
                genome_data.get('web_development_skill', 0)
            ]) / 2)),
            'color_palette': self._get_color_palette(genome_data.get('planet_type', 'unknown')),
            'atmosphere_density': genome_data.get('learning_velocity', 0.5) * 100,
            'terrain_complexity': genome_data.get('problem_solving_approach', 0.5) * 100,
            'special_effects': self._get_special_effects(genome_data),
            'rotation_speed': genome_data.get('exploration_tendency', 0.5) * 2,
            'glow_intensity': genome_data.get('innovation_drive', 0.5) * 100
        }
    
    def _get_color_palette(self, planet_type: str) -> List[str]:
        """Get color palette based on planet type"""
        palettes = {
            'minimalist': ['#2D3748', '#4A5568', '#718096'],
            'chaotic': ['#E53E3E', '#DD6B20', '#D69E2E'],
            'structured': ['#3182CE', '#2B6CB0', '#2C5282'],
            'creative': ['#9F7AEA', '#805AD5', '#6B46C1'],
            'analytical': ['#38A169', '#2F855A', '#276749']
        }
        return palettes.get(planet_type, ['#4A5568', '#718096', '#A0AEC0'])
    
    def _get_special_effects(self, genome_data: Dict) -> List[str]:
        """Get special visual effects based on skills"""
        effects = []
        
        if genome_data.get('algorithm_mastery', 0) > 80:
            effects.append('algorithm_aurora')
        if genome_data.get('web_development_skill', 0) > 80:
            effects.append('web_constellation')
        if genome_data.get('security_awareness', 0) > 70:
            effects.append('security_shield')
        if genome_data.get('innovation_drive', 0) > 80:
            effects.append('innovation_nebula')
            
        return effects
    
    def _calculate_skill_changes(self, planet: Planet, genome_data: Dict) -> Dict[str, float]:
        """Calculate changes in skill levels"""
        return {
            'algorithm': max(0, genome_data.get('algorithm_mastery', 0) - planet.algorithm_mastery),
            'web': max(0, genome_data.get('web_development_skill', 0) - planet.web_development_skill),
            'api': max(0, genome_data.get('api_design_discipline', 0) - planet.api_design_discipline),
            'devops': max(0, genome_data.get('devops_maturity', 0) - planet.devops_maturity),
            'security': max(0, genome_data.get('security_awareness', 0) - planet.security_awareness)
        }
    
    def _calculate_evolution_stage(self, planet: Planet) -> str:
        """Calculate evolution stage based on skill levels"""
        total_skill = (
            planet.algorithm_mastery + planet.web_development_skill +
            planet.api_design_discipline + planet.devops_maturity +
            planet.security_awareness
        ) / 5
        
        if total_skill < 20:
            return 'proto_planet'
        elif total_skill < 40:
            return 'rocky_planet'
        elif total_skill < 60:
            return 'terrestrial_planet'
        elif total_skill < 80:
            return 'gas_giant'
        else:
            return 'stellar_planet'
    
    def _calculate_evolution_points(self, skill_changes: Dict[str, float], stage_changed: bool) -> int:
        """Calculate evolution points earned"""
        points = sum(skill_changes.values())
        if stage_changed:
            points += 50  # Bonus for stage evolution
        return int(points)
    
    def _generate_evolution_description(self, skill_changes: Dict[str, float], 
                                       stage_changed: bool, new_stage: str) -> str:
        """Generate description for evolution event"""
        if stage_changed:
            return f"Planet evolved to {new_stage.replace('_', ' ').title()}!"
        
        improved_skills = [skill for skill, change in skill_changes.items() if change > 0]
        
        if improved_skills:
            skill_list = ', '.join(improved_skills)
            return f"Improved skills: {skill_list}"
        
        return "Continued coding session"
    
    async def _update_planet_cache(self, planet: Planet):
        """Update planet cache with latest data"""
        planet_data = {
            'id': str(planet.id),
            'name': planet.name,
            'type': planet.planet_type,
            'visual_params': planet.visual_params,
            'skills': {
                'algorithm': planet.algorithm_mastery,
                'web': planet.web_development_skill,
                'api': planet.api_design_discipline,
                'devops': planet.devops_maturity,
                'security': planet.security_awareness
            },
            'evolution': {
                'stage': planet.evolution_stage,
                'points': planet.evolution_points,
                'velocity': planet.learning_velocity
            }
        }
        
        await self.redis.setex(
            f"planet:{planet.id}",
            3600,
            json.dumps(planet_data)
        )
    
    async def _evolution_processor(self):
        """Background task for processing evolution events"""
        while self.active:
            try:
                # Process any pending evolution events
                await asyncio.sleep(5)  # Check every 5 seconds
                
                # This could process more complex evolution logic
                # like ecosystem interactions, achievement unlocks, etc.
                
            except Exception as e:
                logger.error(f"Evolution processor error: {e}")