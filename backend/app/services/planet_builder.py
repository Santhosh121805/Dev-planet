#!/usr/bin/env python3
"""
Planet Builder Service - Creates unique coding planets using AI
"""

import random
import json
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib
from loguru import logger

from .groq_ai import groq_service

@dataclass
class PlanetCharacteristics:
    """Planet visual and behavioral characteristics"""
    name: str
    terrain_type: str  # "volcanic", "oceanic", "crystalline", "forest", "desert", "arctic", "gaseous"
    atmosphere: str    # "oxygen_rich", "methane", "silicon_based", "energy_plasma", "void"
    climate: str       # "tropical", "temperate", "arctic", "scorching", "variable", "stable"
    size: str          # "tiny", "small", "medium", "large", "massive", "stellar"
    orbital_period: int  # days
    moons: int
    rings: bool
    life_forms: List[str]
    special_features: List[str]
    color_palette: List[str]
    evolution_stage: str  # "nascent", "developing", "mature", "advanced", "transcendent"
    coding_influence: Dict[str, str]  # How coding style affects planet

@dataclass
class PlanetPersonality:
    """Planet's behavioral traits and preferences"""
    dominant_traits: List[str]
    learning_speed: float  # 0.5 - 2.0 multiplier
    adaptation_style: str  # "rapid", "gradual", "burst", "steady"
    complexity_preference: str  # "simple", "moderate", "complex", "chaotic"
    collaboration_tendency: str  # "solo", "small_team", "large_team", "community"
    innovation_drive: float  # 0.0 - 1.0
    stability_preference: float  # 0.0 - 1.0 (vs experimentation)
    documentation_inclination: float  # 0.0 - 1.0
    optimization_focus: str  # "performance", "readability", "maintainability", "innovation"

class PlanetBuilderAPI:
    """AI-powered planet generation service"""
    
    def __init__(self):
        self.active = False
        self.terrain_templates = {
            "volcanic": {
                "base_colors": ["#FF4500", "#DC143C", "#B22222", "#8B0000"],
                "features": ["lava_rivers", "geysers", "volcanic_peaks", "ash_clouds"],
                "life_forms": ["thermal_organisms", "crystal_entities", "fire_elementals"],
                "coding_traits": ["explosive_development", "hot_fixes", "rapid_iteration"]
            },
            "oceanic": {
                "base_colors": ["#0077BE", "#4682B4", "#5F9EA0", "#008B8B"],
                "features": ["coral_networks", "deep_trenches", "tidal_systems", "bioluminescence"],
                "life_forms": ["aquatic_minds", "collective_intelligence", "flow_entities"],
                "coding_traits": ["fluid_architecture", "stream_processing", "depth_analysis"]
            },
            "crystalline": {
                "base_colors": ["#9370DB", "#8A2BE2", "#4B0082", "#6A0DAD"],
                "features": ["crystal_formations", "resonant_fields", "geometric_patterns", "light_refraction"],
                "life_forms": ["crystalline_beings", "harmonic_entities", "structured_minds"],
                "coding_traits": ["perfect_structure", "modular_design", "clean_architecture"]
            },
            "forest": {
                "base_colors": ["#228B22", "#32CD32", "#9ACD32", "#6B8E23"],
                "features": ["canopy_networks", "root_systems", "symbiotic_cycles", "growth_rings"],
                "life_forms": ["tree_spirits", "symbiotic_networks", "growth_entities"],
                "coding_traits": ["organic_growth", "recursive_patterns", "sustainable_code"]
            },
            "desert": {
                "base_colors": ["#F4A460", "#D2691E", "#CD853F", "#DEB887"],
                "features": ["sand_dunes", "oasis_systems", "wind_patterns", "buried_ruins"],
                "life_forms": ["sand_entities", "nomadic_minds", "survival_specialists"],
                "coding_traits": ["minimalist_design", "resource_efficiency", "robust_systems"]
            },
            "arctic": {
                "base_colors": ["#B0E0E6", "#87CEEB", "#F0F8FF", "#E6E6FA"],
                "features": ["ice_formations", "aurora_displays", "thermal_vents", "frozen_archives"],
                "life_forms": ["ice_entities", "preserved_wisdom", "slow_thinkers"],
                "coding_traits": ["stable_systems", "careful_planning", "long_term_thinking"]
            },
            "gaseous": {
                "base_colors": ["#FFB6C1", "#DDA0DD", "#98FB98", "#F0E68C"],
                "features": ["gas_storms", "floating_islands", "energy_currents", "phase_transitions"],
                "life_forms": ["gas_entities", "energy_beings", "phase_shifters"],
                "coding_traits": ["abstract_thinking", "dynamic_systems", "flexible_architecture"]
            }
        }
        
    async def start(self):
        """Start planet builder service"""
        self.active = True
        logger.info("🌍 Planet Builder API started with Groq AI integration")
        
    async def stop(self):
        """Stop the service"""
        self.active = False
        logger.info("⏹️  Planet Builder API stopped")
        
    def is_active(self) -> bool:
        """Check if service is active"""
        return self.active
        
    async def generate_planet(self, genome_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate planet characteristics from genome data"""
        
        if not self.active:
            raise Exception("Planet Builder service not active")
        
        try:
            # Extract user data from genome
            user_data = {
                "username": genome_data.get("username", "Developer"),
                "preferred_languages": genome_data.get("preferred_languages", []),
                "coding_style": genome_data.get("coding_style", "pragmatic"),
                "experience_level": genome_data.get("experience_level", "intermediate"),
                "project_types": genome_data.get("project_types", []),
                "personality_hints": genome_data.get("personality_hints", [])
            }
            
            coding_history = genome_data.get("coding_history", {})
            
            # Generate planet using AI
            characteristics = await self._generate_planet_with_groq(user_data, coding_history)
            
            # Generate personality
            personality = await self._generate_planet_personality(characteristics, user_data)
            
            # Calculate initial skills based on planet type
            initial_skills = self._calculate_initial_skills(characteristics, user_data)
            
            return {
                "planet_id": self._generate_planet_id(characteristics.name),
                "characteristics": asdict(characteristics),
                "personality": asdict(personality),
                "initial_skills": initial_skills,
                "generation_method": "groq_ai",
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Planet generation failed: {e}")
            # Fallback to basic generation
            return await self._generate_basic_planet(genome_data)
    
    async def _generate_planet_with_groq(self, user_data: Dict, coding_history: Optional[Dict] = None) -> PlanetCharacteristics:
        """Generate planet using Groq AI"""
        
        try:
            # Prepare context for AI
            context = {
                "username": user_data.get("username", "Developer"),
                "preferred_languages": user_data.get("preferred_languages", []),
                "coding_style": user_data.get("coding_style", "pragmatic"),
                "experience_level": user_data.get("experience_level", "intermediate"),
                "project_types": user_data.get("project_types", []),
                "coding_history": coding_history or {},
                "personality_hints": user_data.get("personality_hints", [])
            }
            
            # Generate planet using Groq
            planet_result = await groq_service.generate_planet_description(context)
            
            # Build characteristics from AI result
            return self._build_planet_characteristics(planet_result, user_data)
            
        except Exception as e:
            logger.error(f"Groq planet generation failed: {e}")
            return await self._procedural_generate_planet(user_data, coding_history)
    
    def _build_planet_characteristics(self, ai_data: Dict, user_data: Dict) -> PlanetCharacteristics:
        """Build planet characteristics from AI-generated data"""
        
        # Extract AI suggestions with fallbacks
        terrain_type = ai_data.get("terrain_type", self._infer_terrain_from_user(user_data))
        atmosphere = ai_data.get("atmosphere", "oxygen_rich")
        climate = ai_data.get("climate", "temperate")
        size = ai_data.get("size", "medium")
        
        # Get terrain template
        terrain_template = self.terrain_templates.get(terrain_type, self.terrain_templates["forest"])
        
        # Generate name
        name = ai_data.get("name") or self._generate_planet_name(user_data, terrain_type)
        
        # Orbital characteristics
        orbital_period = ai_data.get("orbital_period", random.randint(200, 800))
        moons = ai_data.get("moons", random.randint(0, 3))
        rings = ai_data.get("rings", random.choice([True, False]))
        
        # Life forms
        life_forms = ai_data.get("life_forms", terrain_template["life_forms"])
        
        # Special features
        special_features = ai_data.get("special_features", [])
        special_features.extend(terrain_template["features"][:2])
        
        # Color palette
        base_colors = terrain_template["base_colors"]
        accent_colors = ai_data.get("accent_colors", [])
        color_palette = base_colors + accent_colors
        
        # Evolution stage
        evolution_stage = self._determine_evolution_stage(user_data)
        
        # Coding influence
        coding_influence = {
            "architecture_style": ai_data.get("architecture_influence", "modular"),
            "optimization_focus": ai_data.get("optimization_focus", "readability"),
            "collaboration_pattern": ai_data.get("collaboration_pattern", "team_oriented"),
            "innovation_tendency": ai_data.get("innovation_tendency", "balanced")
        }
        coding_influence.update({trait: "active" for trait in terrain_template["coding_traits"]})
        
        return PlanetCharacteristics(
            name=name,
            terrain_type=terrain_type,
            atmosphere=atmosphere,
            climate=climate,
            size=size,
            orbital_period=orbital_period,
            moons=moons,
            rings=rings,
            life_forms=life_forms,
            special_features=special_features,
            color_palette=color_palette,
            evolution_stage=evolution_stage,
            coding_influence=coding_influence
        )
    
    async def _procedural_generate_planet(self, user_data: Dict, coding_history: Optional[Dict]) -> PlanetCharacteristics:
        """Fallback procedural planet generation"""
        
        terrain_type = self._infer_terrain_from_user(user_data)
        terrain_template = self.terrain_templates[terrain_type]
        name = self._generate_planet_name(user_data, terrain_type)
        
        return PlanetCharacteristics(
            name=name,
            terrain_type=terrain_type,
            atmosphere=random.choice(["oxygen_rich", "methane", "silicon_based", "energy_plasma"]),
            climate=random.choice(["tropical", "temperate", "arctic", "scorching", "variable"]),
            size=random.choice(["small", "medium", "large"]),
            orbital_period=random.randint(200, 800),
            moons=random.randint(0, 3),
            rings=random.choice([True, False]),
            life_forms=terrain_template["life_forms"],
            special_features=terrain_template["features"][:2],
            color_palette=terrain_template["base_colors"],
            evolution_stage=self._determine_evolution_stage(user_data),
            coding_influence={trait: "active" for trait in terrain_template["coding_traits"]}
        )
    
    def _infer_terrain_from_user(self, user_data: Dict) -> str:
        """Infer planet terrain from user coding preferences"""
        
        languages = user_data.get("preferred_languages", [])
        style = user_data.get("coding_style", "pragmatic")
        project_types = user_data.get("project_types", [])
        
        # Language-based terrain inference
        if any(lang in ["python", "javascript", "typescript"] for lang in languages):
            if "web" in project_types:
                return "oceanic"
            else:
                return "forest"
        elif any(lang in ["java", "c#", "kotlin"] for lang in languages):
            return "crystalline"
        elif any(lang in ["c", "c++", "rust", "go"] for lang in languages):
            return "volcanic"
        elif any(lang in ["haskell", "lisp", "prolog"] for lang in languages):
            return "gaseous"
        elif any(lang in ["assembly", "embedded"] for lang in languages):
            return "desert"
        
        # Style-based inference
        style_map = {
            "minimalist": "desert",
            "experimental": "gaseous",
            "methodical": "crystalline",
            "rapid": "volcanic"
        }
        
        return style_map.get(style, "forest")
    
    def _generate_planet_name(self, user_data: Dict, terrain_type: str) -> str:
        """Generate unique planet name"""
        
        terrain_prefixes = {
            "volcanic": ["Ignis", "Pyro", "Magma", "Vulcan", "Inferno"],
            "oceanic": ["Aqua", "Hydro", "Neptune", "Coral", "Tidal"],
            "crystalline": ["Prisma", "Quartz", "Crystal", "Gemini", "Lattice"],
            "forest": ["Silva", "Verde", "Canopy", "Root", "Growth"],
            "desert": ["Arid", "Dune", "Sahara", "Oasis", "Mirage"],
            "arctic": ["Glacia", "Frost", "Aurora", "Ice", "Polar"],
            "gaseous": ["Nebula", "Vapor", "Storm", "Cloud", "Ether"]
        }
        
        suffixes = ["prime", "nova", "core", "sphere", "world", "realm", "haven", "forge"]
        
        user_hash = hashlib.md5(user_data.get("username", "dev").encode()).hexdigest()[:6]
        prefix = random.choice(terrain_prefixes[terrain_type])
        suffix = random.choice(suffixes)
        
        return f"{prefix}-{suffix}-{user_hash}"
    
    def _determine_evolution_stage(self, user_data: Dict) -> str:
        """Determine planet evolution stage"""
        
        experience_map = {
            "beginner": "nascent",
            "intermediate": "developing",
            "advanced": "mature",
            "expert": "advanced"
        }
        
        experience = user_data.get("experience_level", "beginner")
        return experience_map.get(experience, "developing")
    
    def _generate_planet_id(self, planet_name: str) -> str:
        """Generate unique planet ID"""
        return f"planet_{hashlib.md5(planet_name.encode()).hexdigest()[:12]}"
    
    def _calculate_initial_skills(self, characteristics: PlanetCharacteristics, user_data: Dict) -> Dict[str, float]:
        """Calculate initial skill levels based on planet and user data"""
        
        base_skills = {
            "algorithm_mastery": 5.0,
            "web_development_skill": 3.0,
            "api_design_discipline": 2.0,
            "devops_maturity": 1.0,
            "security_awareness": 1.5
        }
        
        # Adjust based on terrain type
        terrain_bonuses = {
            "volcanic": {"algorithm_mastery": 3.0, "devops_maturity": 2.0},
            "oceanic": {"web_development_skill": 4.0, "api_design_discipline": 2.0},
            "crystalline": {"api_design_discipline": 3.0, "security_awareness": 2.0},
            "forest": {"algorithm_mastery": 2.0, "web_development_skill": 2.0},
            "desert": {"devops_maturity": 3.0, "security_awareness": 2.0},
            "arctic": {"security_awareness": 3.0, "algorithm_mastery": 1.0},
            "gaseous": {"algorithm_mastery": 4.0, "api_design_discipline": 1.0}
        }
        
        bonuses = terrain_bonuses.get(characteristics.terrain_type, {})
        
        for skill, bonus in bonuses.items():
            base_skills[skill] += bonus
        
        # Adjust based on experience
        experience_multipliers = {
            "beginner": 0.8,
            "intermediate": 1.0,
            "advanced": 1.3,
            "expert": 1.6
        }
        
        multiplier = experience_multipliers.get(user_data.get("experience_level", "beginner"), 1.0)
        
        return {skill: value * multiplier for skill, value in base_skills.items()}
    
    async def _generate_planet_personality(self, characteristics: PlanetCharacteristics, user_data: Dict) -> PlanetPersonality:
        """Generate planet personality traits"""
        
        terrain_personalities = {
            "volcanic": {
                "traits": ["explosive", "passionate", "intense", "quick_to_adapt"],
                "learning_speed": 1.5,
                "adaptation_style": "rapid",
                "complexity_preference": "complex",
                "innovation_drive": 0.9
            },
            "oceanic": {
                "traits": ["fluid", "collaborative", "deep_thinking", "harmonious"],
                "learning_speed": 1.2,
                "adaptation_style": "gradual",
                "complexity_preference": "moderate",
                "innovation_drive": 0.7
            },
            "crystalline": {
                "traits": ["structured", "precise", "methodical", "patient"],
                "learning_speed": 1.0,
                "adaptation_style": "steady",
                "complexity_preference": "moderate",
                "innovation_drive": 0.5
            },
            "forest": {
                "traits": ["organic", "growing", "interconnected", "sustainable"],
                "learning_speed": 1.1,
                "adaptation_style": "gradual",
                "complexity_preference": "simple",
                "innovation_drive": 0.6
            },
            "desert": {
                "traits": ["minimalist", "efficient", "resilient", "focused"],
                "learning_speed": 0.9,
                "adaptation_style": "steady",
                "complexity_preference": "simple",
                "innovation_drive": 0.4
            },
            "arctic": {
                "traits": ["stable", "contemplative", "thorough", "preserving"],
                "learning_speed": 0.8,
                "adaptation_style": "steady",
                "complexity_preference": "moderate",
                "innovation_drive": 0.3
            },
            "gaseous": {
                "traits": ["abstract", "flexible", "experimental", "dynamic"],
                "learning_speed": 1.8,
                "adaptation_style": "burst",
                "complexity_preference": "chaotic",
                "innovation_drive": 1.0
            }
        }
        
        terrain_data = terrain_personalities.get(characteristics.terrain_type, terrain_personalities["forest"])
        
        return PlanetPersonality(
            dominant_traits=terrain_data["traits"],
            learning_speed=terrain_data["learning_speed"],
            adaptation_style=terrain_data["adaptation_style"],
            complexity_preference=terrain_data["complexity_preference"],
            collaboration_tendency=user_data.get("collaboration_style", "small_team"),
            innovation_drive=terrain_data["innovation_drive"],
            stability_preference=1.0 - terrain_data["innovation_drive"],
            documentation_inclination=user_data.get("documentation_preference", 0.5),
            optimization_focus=user_data.get("optimization_focus", "readability")
        )
    
    async def _generate_basic_planet(self, genome_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback basic planet generation"""
        
        terrain_types = ["volcanic", "oceanic", "crystalline", "forest", "desert", "arctic", "gaseous"]
        terrain = random.choice(terrain_types)
        
        return {
            "planet_id": f"basic_planet_{random.randint(1000, 9999)}",
            "characteristics": {
                "name": f"Basic-{terrain.title()}-World",
                "terrain_type": terrain,
                "atmosphere": "oxygen_rich",
                "climate": "temperate",
                "size": "medium",
                "evolution_stage": "developing",
                "color_palette": self.terrain_templates[terrain]["base_colors"]
            },
            "initial_skills": {
                "algorithm_mastery": 5.0,
                "web_development_skill": 3.0,
                "api_design_discipline": 2.0,
                "devops_maturity": 1.0,
                "security_awareness": 1.5
            },
            "generation_method": "basic_fallback"
        }
        
    async def evolve_planet(self, planet_id: str, skill_deltas: Dict[str, float]) -> Dict[str, Any]:
        """Apply evolution to planet based on skill improvements"""
        
        if not self.active:
            raise Exception("Planet Builder service not active")
        
        try:
            # Calculate evolution points
            evolution_points = sum(skill_deltas.values())
            
            # Determine if major evolution occurred
            major_evolution = evolution_points > 10.0
            visual_changes = evolution_points > 5.0
            
            # Use Groq for evolution analysis if major changes
            if major_evolution:
                evolution_analysis = await groq_service.analyze_code_behavior({
                    "skill_deltas": skill_deltas,
                    "evolution_points": evolution_points,
                    "planet_id": planet_id
                })
                
                planet_updates = evolution_analysis.get("planet_updates", {})
            else:
                planet_updates = {}
            
            return {
                "planet_id": planet_id,
                "evolution_applied": True,
                "points_earned": evolution_points,
                "stage_changed": major_evolution,
                "visual_updated": visual_changes,
                "new_features": planet_updates.get("new_features", []),
                "skill_bonuses": planet_updates.get("skill_bonuses", {}),
                "evolution_method": "groq_ai" if major_evolution else "standard"
            }
            
        except Exception as e:
            logger.error(f"Planet evolution failed: {e}")
            
            # Fallback evolution
            evolution_points = sum(skill_deltas.values())
            return {
                "planet_id": planet_id,
                "evolution_applied": True,
                "points_earned": evolution_points,
                "stage_changed": evolution_points > 10,
                "visual_updated": evolution_points > 3,
                "evolution_method": "fallback"
            }