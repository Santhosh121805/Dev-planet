#!/usr/bin/env python3
"""
Planet Code Forge Backend - Main Application

A production-grade backend that transforms code behavior into living digital planets.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from loguru import logger
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.auth import auth_router
from app.api.planet import planet_router
from app.api.genome import genome_router
from app.api.evolution import evolution_router
from app.api.stream import stream_router
from app.services.groq_ai import groq_service
from app.services.genome_lab import genome_lab_engine
from app.services.planet_builder import PlanetBuilderAPI
from config import load_config

# Global service instances
planet_builder = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    global planet_builder
    
    logger.info("🚀 Starting Planet Code Forge Backend...")
    
    try:
        # Load configuration
        config = load_config()
        logger.info(f"✅ Configuration loaded - Groq Model: {config.groq_model}")
        
        # Test Groq connection
        groq_test = await groq_service.test_connection()
        if groq_test:
            logger.success("✅ Groq AI service connected")
        else:
            logger.warning("⚠️  Groq AI service connection failed - using fallback methods")
        
        # Initialize services
        await genome_lab_engine.start()
        logger.info("✅ Genome Lab Engine started")
        
        planet_builder = PlanetBuilderAPI()
        await planet_builder.start()
        logger.info("✅ Planet Builder started")
        
        logger.success("🌍 Planet Code Forge Backend is ready!")
        logger.info(f"   - API Server: Running")
        logger.info(f"   - WebSocket: Available at /stream/ws/{{user_id}}")
        logger.info(f"   - API Docs: http://localhost:8000/docs")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        logger.info("💡 Make sure you have created .env file with GROQ_API_KEY")
        raise
    finally:
        # Cleanup
        logger.info("🛑 Shutting down services...")
        await genome_lab_engine.stop()
        if planet_builder:
            await planet_builder.stop()
        logger.success("✅ Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Planet Code Forge API",
    description="AI-powered coding genome analysis and planet evolution platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:8080",
        "http://localhost:4173"
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(auth_router, prefix="/api", tags=["Authentication"])
app.include_router(planet_router, prefix="/api", tags=["Planet"])
app.include_router(genome_router, prefix="/api", tags=["Genome"])
app.include_router(evolution_router, prefix="/api", tags=["Evolution"])
app.include_router(stream_router, prefix="/stream", tags=["Real-time Streaming"])

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "message": "🌍 Planet Code Forge Backend API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "groq_ai": groq_service.is_available(),
            "genome_lab": genome_lab_engine.is_active(),
            "planet_builder": planet_builder.is_active() if planet_builder else False
        },
        "endpoints": {
            "api_docs": "/docs",
            "websocket": "/stream/ws/{user_id}",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint for monitoring"""
    
    services_status = {}
    overall_health = "healthy"
    
    # Check Groq AI service
    try:
        groq_available = groq_service.is_available()
        if groq_available:
            groq_test = await groq_service.test_connection()
            services_status["groq_ai"] = "connected" if groq_test else "connection_failed"
        else:
            services_status["groq_ai"] = "not_configured"
    except Exception as e:
        services_status["groq_ai"] = f"error: {str(e)}"
        overall_health = "degraded"
    
    # Check other services
    services_status["genome_lab"] = "active" if genome_lab_engine.is_active() else "inactive"
    services_status["planet_builder"] = "active" if planet_builder and planet_builder.is_active() else "inactive"
    
    # Determine overall health
    if any("error" in str(status) or "failed" in str(status) for status in services_status.values()):
        overall_health = "degraded"
    elif any("inactive" in str(status) for status in services_status.values()):
        overall_health = "starting"
    
    return {
        "status": overall_health,
        "timestamp": datetime.utcnow().isoformat(),
        "services": services_status,
        "uptime": "running",
        "version": "1.0.0"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if app.debug else "Something went wrong",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    config = load_config()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=config.debug,
        log_level="info"
    )