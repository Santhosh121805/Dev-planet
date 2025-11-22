#!/bin/bash

# Planet Code Forge - Quick Start Script
echo "🚀 Starting Planet Code Forge..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API is running at http://localhost:8000"
else
    echo "⚠️  Backend API might still be starting... (Status: $BACKEND_STATUS)"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is running at http://localhost:5173"
else
    echo "⚠️  Frontend might still be starting... (Status: $FRONTEND_STATUS)"
fi

echo ""
echo "🌍 Planet Code Forge is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "💾 Database: postgres://postgres:postgres@localhost:5432/planetforge"
echo "🔄 Redis: redis://localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop services: docker-compose down"
echo ""
echo "🎯 Start analyzing code to see your planet evolve in real-time!"