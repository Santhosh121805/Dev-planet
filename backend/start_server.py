#!/usr/bin/env python3
"""
Planet Code Forge Backend Server
Main entry point for the FastAPI application
"""

import asyncio
import uvicorn
from pathlib import Path
import sys

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.config import load_config
from loguru import logger

def main():
    """Main server startup function"""
    
    try:
        # Load configuration
        config = load_config()
        
        logger.info("🌍 Starting Planet Code Forge Backend...")
        logger.info(f"   - Groq Model: {config.groq_model}")
        logger.info(f"   - Environment: {config.environment}")
        logger.info(f"   - Debug Mode: {config.debug}")
        
        # Run the server
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=config.debug,
            log_level="info" if not config.debug else "debug",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        logger.info("💡 Try running setup.py first: python setup.py")
        sys.exit(1)

if __name__ == "__main__":
    main()