#!/usr/bin/env python3
"""
Database models for Planet Code Forge
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from config import config

# Database setup
engine = create_engine(config.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    """User account information"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=True)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    planets = relationship("Planet", back_populates="user")
    code_sessions = relationship("CodeSession", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")

class Planet(Base):
    """User's unique coding planet"""
    __tablename__ = "planets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    planet_type = Column(String, nullable=False)  # minimalist, chaotic, structured, etc.
    
    # Visual properties
    visual_params = Column(JSON)  # Color palette, size, effects, etc.
    atmosphere = Column(String)
    terrain = Column(String)
    
    # Skill levels (0-100)
    algorithm_mastery = Column(Float, default=0)
    web_development_skill = Column(Float, default=0)
    api_design_discipline = Column(Float, default=0)
    devops_maturity = Column(Float, default=0)
    security_awareness = Column(Float, default=0)
    
    # Evolution tracking
    evolution_stage = Column(String, default="proto_planet")
    evolution_points = Column(Integer, default=0)
    learning_velocity = Column(Float, default=0.5)
    exploration_tendency = Column(Float, default=0.5)
    
    # Personality traits
    code_elegance = Column(Float, default=0.5)
    innovation_drive = Column(Float, default=0.5)
    collaboration_style = Column(Float, default=0.5)
    problem_solving_approach = Column(Float, default=0.5)
    
    # Blockchain integration
    nft_token_id = Column(String, nullable=True)
    contract_address = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="planets")
    evolution_events = relationship("EvolutionEvent", back_populates="planet")

class CodeSession(Base):
    """Individual code analysis session"""
    __tablename__ = "code_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Session metadata
    language = Column(String)
    duration_seconds = Column(Integer)
    code_length = Column(Integer)  # character count
    
    # Behavioral metrics (privacy-safe)
    behavior_fingerprint = Column(String)  # Hash of behavior patterns
    skill_improvements = Column(JSON)  # Changes in skill scores
    
    # Analysis results
    genome_generated = Column(Boolean, default=False)
    planet_evolution_triggered = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="code_sessions")

class EvolutionEvent(Base):
    """Planet evolution history"""
    __tablename__ = "evolution_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planet_id = Column(UUID(as_uuid=True), ForeignKey("planets.id"), nullable=False)
    
    event_type = Column(String)  # skill_unlock, terrain_change, achievement, etc.
    description = Column(Text)
    metadata = Column(JSON)  # Event-specific data
    
    # Before/after state
    previous_state = Column(JSON)
    new_state = Column(JSON)
    
    points_earned = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    planet = relationship("Planet", back_populates="evolution_events")

class Achievement(Base):
    """User achievements and badges"""
    __tablename__ = "achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    achievement_type = Column(String)  # skill_badge, milestone, special_event
    name = Column(String)
    description = Column(Text)
    icon_url = Column(String)
    
    # Requirements
    requirements_met = Column(JSON)
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="achievements")

class SkillChallenge(Base):
    """Dynamic skill challenges for users"""
    __tablename__ = "skill_challenges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    challenge_type = Column(String)  # algorithm, web, api, devops, security
    title = Column(String)
    description = Column(Text)
    difficulty_level = Column(String)  # beginner, intermediate, advanced, expert
    
    # Challenge data
    requirements = Column(JSON)  # What user needs to demonstrate
    success_criteria = Column(JSON)  # How to measure completion
    
    # Rewards
    skill_points = Column(JSON)  # Points awarded for each skill
    evolution_points = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency for FastAPI
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()