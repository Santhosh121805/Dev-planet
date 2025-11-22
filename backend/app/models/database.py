#!/usr/bin/env python3
"""
Database models for Planet Code Forge
Based on the architecture from the notebook
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa

Base = declarative_base()

class PlanetType(str, Enum):
    TERRESTRIAL = "terrestrial"
    GAS_GIANT = "gas_giant"
    ICE_WORLD = "ice_world"
    DESERT = "desert"
    OCEANIC = "oceanic"
    VOLCANIC = "volcanic"
    CRYSTALLINE = "crystalline"
    CHAOTIC = "chaotic"

class EvolutionStage(str, Enum):
    PROTOPLANET = "protoplanet"
    YOUNG_WORLD = "young_world"
    MATURE_PLANET = "mature_planet"
    ANCIENT_WORLD = "ancient_world"
    TRANSCENDED = "transcended"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_address = Column(String, unique=True, nullable=True)  # Web3 wallet
    email = Column(String, unique=True, nullable=True)  # Traditional auth
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    # Profile information
    display_name = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)
    
    # Privacy settings
    profile_public = Column(Boolean, default=True)
    analytics_consent = Column(Boolean, default=True)
    
    # Relationships
    planets = relationship("Planet", back_populates="owner")
    code_sessions = relationship("CodeSession", back_populates="user")

class Planet(Base):
    __tablename__ = "planets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic planet info
    name = Column(String, nullable=False)
    planet_type = Column(sa.Enum(PlanetType), default=PlanetType.TERRESTRIAL)
    evolution_stage = Column(sa.Enum(EvolutionStage), default=EvolutionStage.PROTOPLANET)
    
    # Visual characteristics
    atmosphere = Column(String)  # e.g., "neon", "crystalline", "stormy"
    terrain = Column(String)     # e.g., "rocky", "liquid", "crystal_formations"
    primary_color = Column(String)
    secondary_color = Column(String)
    
    # Skill levels (0-100)\n    algorithm_mastery = Column(Float, default=0.0)
    web_development_skill = Column(Float, default=0.0)
    api_design_discipline = Column(Float, default=0.0)
    devops_maturity = Column(Float, default=0.0)
    security_awareness = Column(Float, default=0.0)
    
    # Evolution data
    evolution_points = Column(Integer, default=0)
    total_code_time = Column(Integer, default=0)  # in minutes
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # NFT data
    nft_token_id = Column(Integer, unique=True, nullable=True)
    nft_metadata_uri = Column(String)
    
    # Visual generation data
    visual_seed = Column(String)  # Seed for consistent generation
    last_visual_update = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="planets")
    code_sessions = relationship("CodeSession", back_populates="planet")
    evolution_events = relationship("EvolutionEvent", back_populates="planet")
    achievements = relationship("Achievement", back_populates="planet")

class CodeSession(Base):
    __tablename__ = "code_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    planet_id = Column(UUID(as_uuid=True), ForeignKey("planets.id"), nullable=False)
    
    # Session metadata
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    
    # Code analysis results (privacy-safe behavioral data only)
    language_detected = Column(String)
    framework_detected = Column(String)
    
    # Behavioral metrics (no actual code stored)
    lines_analyzed = Column(Integer, default=0)
    functions_created = Column(Integer, default=0)
    classes_created = Column(Integer, default=0)
    comments_ratio = Column(Float, default=0.0)
    complexity_score = Column(Float, default=0.0)
    
    # Style analysis
    coding_style = Column(JSON)  # Stores style patterns, not code
    skill_improvements = Column(JSON)  # Skill deltas during session
    
    # Real-time metrics
    keystrokes = Column(Integer, default=0)
    active_time_ratio = Column(Float, default=0.0)  # % of session actively coding
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="code_sessions")
    planet = relationship("Planet", back_populates="code_sessions")

class EvolutionEvent(Base):
    __tablename__ = "evolution_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planet_id = Column(UUID(as_uuid=True), ForeignKey("planets.id"), nullable=False)
    
    # Event details
    event_type = Column(String, nullable=False)  # "skill_level_up", "stage_evolution", "achievement"
    description = Column(Text)
    points_earned = Column(Integer, default=0)
    
    # Before/after state
    previous_state = Column(JSON)
    new_state = Column(JSON)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    planet = relationship("Planet", back_populates="evolution_events")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planet_id = Column(UUID(as_uuid=True), ForeignKey("planets.id"), nullable=False)
    
    # Achievement info
    achievement_id = Column(String, nullable=False)  # e.g., "first_function", "code_master"
    title = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    points = Column(Integer, default=0)
    rarity = Column(String)  # "common", "rare", "epic", "legendary"
    
    # Unlock details
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    unlock_condition = Column(JSON)  # What triggered the achievement
    
    # Relationships
    planet = relationship("Planet", back_populates="achievements")

# Database indexes for performance
Index('idx_users_wallet', User.wallet_address)
Index('idx_users_email', User.email)
Index('idx_planets_owner', Planet.owner_id)
Index('idx_planets_nft', Planet.nft_token_id)
Index('idx_sessions_user_time', CodeSession.user_id, CodeSession.start_time)
Index('idx_sessions_planet', CodeSession.planet_id)
Index('idx_evolution_planet_time', EvolutionEvent.planet_id, EvolutionEvent.timestamp)
Index('idx_achievements_planet', Achievement.planet_id)