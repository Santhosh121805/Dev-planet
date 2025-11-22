@echo off
REM Planet Code Forge - Quick Start Script for Windows

echo 🚀 Starting Planet Code Forge...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build and start services
echo 📦 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...
echo.

REM Check if services are responding
curl -s -o nul http://localhost:8000/health
if errorlevel 1 (
    echo ⚠️  Backend API might still be starting...
) else (
    echo ✅ Backend API is running at http://localhost:8000
)

curl -s -o nul http://localhost:5173
if errorlevel 1 (
    echo ⚠️  Frontend might still be starting...
) else (
    echo ✅ Frontend is running at http://localhost:5173
)

echo.
echo 🌍 Planet Code Forge is starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 💾 Database: postgres://postgres:postgres@localhost:5432/planetforge
echo 🔄 Redis: redis://localhost:6379
echo.
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop services: docker-compose down
echo.
echo 🎯 Start analyzing code to see your planet evolve in real-time!
echo.
pause