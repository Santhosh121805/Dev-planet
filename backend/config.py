#!/usr/bin/env python3
"""
Configuration management for Planet Code Forge Backend
"""

import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

@dataclass
class PlanetForgeConfig:
    """Configuration for Planet Code Forge backend services"""
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_VERSION: str = "v1"
    
    # Database Configuration  
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "planetforge")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    
    # Web3 Configuration
    WEB3_PROVIDER_URL: str = os.getenv("WEB3_PROVIDER_URL", "http://localhost:8545")
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    
    # ML Model Configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    HUGGINGFACE_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_TOKEN")
    
    # Groq API Configuration (Fast AI Inference)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "planet-forge-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 3600  # 1 hour
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    OAUTH_REDIRECT_URL: str = os.getenv("OAUTH_REDIRECT_URL", "http://localhost:8086")
    
    # Performance
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))
    CODE_ANALYSIS_TIMEOUT: int = 30
    WEBSOCKET_HEARTBEAT: int = 30
    
    # Debug mode
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Features
    ENABLE_WEB3: bool = os.getenv("ENABLE_WEB3", "true").lower() == "true"
    ENABLE_ML_TRAINING: bool = os.getenv("ENABLE_ML_TRAINING", "true").lower() == "true"
    ENABLE_MONITORING: bool = os.getenv("ENABLE_MONITORING", "true").lower() == "true"
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property 
    def redis_url(self) -> str:
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    # Convenience properties for lowercase access
    @property
    def groq_model(self) -> str:
        return self.GROQ_MODEL
        
    @property  
    def groq_api_key(self) -> str:
        return self.GROQ_API_KEY

# Global configuration instance
config = PlanetForgeConfig()

def load_config() -> PlanetForgeConfig:
    """Load configuration instance"""
    return config