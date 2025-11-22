#!/usr/bin/env python3
"""
Planet Code Forge Setup Script
Initializes the backend with database, services, and configurations
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from app.config import config, load_config
    from app.models.database import engine, Base
    from app.services.groq_ai import groq_service
    from sqlalchemy import text
    from loguru import logger
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the backend directory and have installed dependencies.")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

async def test_groq_connection():
    """Test Groq AI service connection"""
    print("🤖 Testing Groq AI connection...")
    
    try:
        test_result = await groq_service.test_connection()
        if test_result:
            print("✅ Groq AI service connection successful!")
            return True
        else:
            print("❌ Groq AI service connection failed")
            return False
    except Exception as e:
        print(f"❌ Groq AI test error: {e}")
        print("💡 Make sure you have:")
        print("   1. Created .env file from .env.example")
        print("   2. Added your Groq API key: GROQ_API_KEY=gsk_your_key_here")
        print("   3. Get API key from: https://console.groq.com/keys")
        return False

async def setup_database():
    """Initialize database tables"""
    print("🗄️  Setting up database...")
    
    try:
        # Test database connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("💡 Make sure PostgreSQL is running and connection details are correct in .env")
        return False

def check_environment_file():
    """Check if .env file exists and has required variables"""
    print("🔧 Checking environment configuration...")
    
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("⚠️  .env file not found. Please create it from .env.example:")
            print("   cp .env.example .env")
            print("   # Then edit .env with your actual values")
            return False
        else:
            print("❌ Neither .env nor .env.example found!")
            return False
    
    # Check for required environment variables
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    required_vars = ['GROQ_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if f"{var}=" not in env_content or f"{var}=your_" in env_content:
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing or incomplete environment variables: {', '.join(missing_vars)}")
        print("💡 Please update your .env file with:")
        for var in missing_vars:
            if var == 'GROQ_API_KEY':
                print(f"   {var}=gsk_your_groq_api_key_here  # Get from https://console.groq.com/keys")
        return False
    
    print("✅ Environment configuration looks good!")
    return True

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("📦 Checking dependencies...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'sqlalchemy', 'asyncpg', 
        'httpx', 'pydantic', 'loguru', 'python-dotenv'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("💡 Install with: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed!")
    return True

async def test_services():
    """Test all backend services"""
    print("🧪 Testing backend services...")
    
    tests_passed = 0
    total_tests = 0
    
    # Test Groq AI Service
    total_tests += 1
    if await test_groq_connection():
        tests_passed += 1
    
    # Test configuration loading
    total_tests += 1
    try:
        test_config = load_config()
        if test_config.groq_api_key:
            print("✅ Configuration loading successful!")
            tests_passed += 1
        else:
            print("❌ Configuration missing Groq API key")
    except Exception as e:
        print(f"❌ Configuration loading failed: {e}")
    
    print(f"🧪 Service tests: {tests_passed}/{total_tests} passed")
    return tests_passed == total_tests

def print_startup_instructions():
    """Print instructions for starting the server"""
    print("\n🚀 Setup complete! To start the Planet Code Forge backend:")
    print("\n1. Make sure you're in the backend directory:")
    print("   cd backend")
    print("\n2. Start the development server:")
    print("   python main.py")
    print("\n3. Or use uvicorn directly:")
    print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print("\n4. API will be available at:")
    print("   - http://localhost:8000")
    print("   - API docs: http://localhost:8000/docs")
    print("   - WebSocket: ws://localhost:8000/stream/ws/{user_id}")
    print("\n5. Frontend integration:")
    print("   - Update frontend API_URL to http://localhost:8000")
    print("   - Test with sample API calls to /api/health")

async def main():
    """Main setup function"""
    print("🌍 Planet Code Forge Backend Setup")
    print("=" * 50)
    
    setup_success = True
    
    # Check basic requirements
    if not check_dependencies():
        setup_success = False
    
    if not check_environment_file():
        setup_success = False
    
    if not setup_success:
        print("\n❌ Setup requirements not met. Please fix the above issues and try again.")
        return
    
    # Load configuration
    try:
        config_data = load_config()
        print(f"✅ Configuration loaded successfully!")
        print(f"   - Groq Model: {config_data.groq_model}")
        print(f"   - Database URL: {'Set' if config_data.database_url else 'Not set'}")
    except Exception as e:
        print(f"❌ Failed to load configuration: {e}")
        return
    
    # Test services
    services_ok = await test_services()
    
    if not services_ok:
        print("\n⚠️  Some services failed tests but you can still proceed.")
        print("   The backend will use fallback methods where needed.")
    
    # Optional: Setup database (only if connection details provided)
    if config_data.database_url and "postgresql" in config_data.database_url.lower():
        db_setup_ok = await setup_database()
        if not db_setup_ok:
            print("⚠️  Database setup failed, but you can still run the backend.")
            print("   Some features may not work without a database.")
    else:
        print("ℹ️  No database URL configured, skipping database setup.")
    
    print("\n" + "=" * 50)
    print("🎉 Planet Code Forge Backend Setup Complete!")
    
    # Print final status
    print(f"\n📊 Setup Summary:")
    print(f"   ✅ Dependencies installed")
    print(f"   ✅ Environment configured")
    print(f"   {'✅' if services_ok else '⚠️ '} Services tested")
    print(f"   ℹ️  Ready to start!")
    
    print_startup_instructions()

if __name__ == "__main__":
    asyncio.run(main())