# Planet Code Forge - Quick Start Guide

## 🚀 Getting Started with Groq AI Integration

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ (for frontend)
- Groq API account ([Get one here](https://console.groq.com/keys))

### 1. Backend Setup

#### Step 1: Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

#### Step 2: Create Environment File
```powershell
# Copy the template
cp .env.example .env

# Edit .env file and add your Groq API key
# GROQ_API_KEY=gsk_your_groq_api_key_here
```

#### Step 3: Get Your Groq API Key
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up/Login
3. Create a new API key
4. Copy the key (starts with `gsk_`)
5. Add it to your `.env` file:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

#### Step 4: Test Setup
```powershell
python setup.py
```

#### Step 5: Start Backend Server
```powershell
python start_server.py
```

Or manually:
```powershell
python main.py
```

Backend will be available at:
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/health

### 2. Frontend Setup

#### Step 1: Install Dependencies
```powershell
cd ../  # Go back to root
npm install
```

#### Step 2: Start Development Server
```powershell
npm run dev
```

Frontend will be available at: http://localhost:5173

### 3. Test Full Integration

#### Backend Health Check
Visit: http://localhost:8000/health

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "groq_ai": "connected",
    "genome_lab": "active", 
    "planet_builder": "active"
  }
}
```

#### WebSocket Test
Connect to: `ws://localhost:8000/stream/ws/test_user`

#### API Test
```powershell
curl http://localhost:8000/
```

### 4. Key Features

#### Real-time Code Analysis
- **WebSocket Streaming:** Low-latency code behavior analysis
- **Groq AI:** Fast inference using llama-3.1-70b-versatile
- **Planet Evolution:** Your coding style shapes your unique digital planet

#### API Endpoints
- `GET /api/health` - Service health check
- `WS /stream/ws/{user_id}` - Real-time analysis stream
- `POST /api/planets` - Planet management
- `POST /api/genome/analyze` - Code genome analysis

### 5. Troubleshooting

#### Groq API Issues
- **Connection Failed:** Check API key in `.env` file
- **Rate Limits:** Groq provides generous free tier limits
- **Model Access:** Uses llama-3.1-70b-versatile by default

#### Backend Issues
```powershell
# Check logs
python main.py

# Run setup again
python setup.py

# Test individual services
python -c "from app.services.groq_ai import groq_service; import asyncio; print(asyncio.run(groq_service.test_connection()))"
```

#### Frontend Issues
```powershell
# Clear dependencies
rm -rf node_modules
npm install

# Check backend connection
curl http://localhost:8000/health
```

### 6. Development Workflow

1. **Start Backend:** `cd backend && python start_server.py`
2. **Start Frontend:** `npm run dev`
3. **Test Integration:** Open browser to http://localhost:5173
4. **Monitor Health:** Check http://localhost:8000/health

### 7. Production Deployment

#### Environment Variables (Required)
```env
GROQ_API_KEY=gsk_your_production_key
DATABASE_URL=postgresql://user:pass@host/db  # Optional
DEBUG=false
ENVIRONMENT=production
```

#### Docker Deployment
```powershell
# Backend
cd backend
docker build -t planet-forge-backend .
docker run -p 8000:8000 --env-file .env planet-forge-backend

# Frontend
cd ..
npm run build
# Deploy dist/ to your hosting provider
```

### 8. Next Steps

#### Customize Your Planet
- Modify terrain types in `backend/app/services/planet_builder.py`
- Adjust AI prompts in `backend/app/services/groq_ai.py`
- Create custom evolution rules

#### Extend Analysis
- Add new coding metrics in stream analysis
- Implement achievement system
- Create planet sharing features

#### Performance Optimization
- Implement caching for API responses
- Add database for persistence
- Set up monitoring and analytics

---

## 🌍 Planet Code Forge Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │───▶│   FastAPI Backend │───▶│   Groq AI API   │
│   (Port 5173)   │    │   (Port 8000)    │    │   (LLaMA 3.1)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────▶│  WebSocket      │
                         │  Streaming      │
                         └─────────────────┘
```

## 🎯 Key Benefits

- **⚡ Fast AI Analysis:** Groq provides <50ms inference times
- **🔄 Real-time Updates:** WebSocket streaming for live feedback
- **🌍 Visual Planet Evolution:** Your coding style creates unique planets
- **📊 Behavioral Analytics:** Deep insights into coding patterns
- **🎮 Gamified Learning:** Achievement system and progress tracking

Happy coding and planet building! 🚀