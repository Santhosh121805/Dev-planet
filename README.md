
# 🌍 Dev/Planet   live link:- https://dev-planet-c6b7ja65b-ssanthoshs418-gmailcoms-projects.vercel.app?_vercel_share=NpoGS89yun5dv2YV80XK3ncSCEiBp8dP

**Transform Your Code Into Living Worlds**

Planet Code Forge is an innovative platform that visualizes your coding journey as evolving planets and connects developers in an interactive galaxy. Your coding style, frameworks, and contributions shape unique planetary landscapes while building a community of developers in the MilkyWay galaxy.

## ✨ Features

### 🪐 Personal Planet Evolution
- **Real-time Code Analysis**: Your coding style shapes your planet's terrain
- **Dynamic Landscapes**: Planets evolve based on programming patterns
- **Technology-driven Atmospheres**: Different frameworks create unique planetary environments
- **Contribution Tracking**: Your GitHub activity influences planetary weather systems

### 🌌 MilkyWay Developer Galaxy
- **Interactive Developer Network**: Discover developers across the galaxy
- **Profile Creation**: Create your developer profile and join the community
- **Technology Filtering**: Find developers by programming languages and frameworks
- **Real-time Collaboration**: Connect with like-minded developers

### 🔐 Secure Authentication
- **OAuth Integration**: Sign in with Google or GitHub
- **JWT Token Management**: Secure session handling
- **Demo Mode**: Try the platform without OAuth setup

### 🏗️ Domain Planets
- **AlgoNebula**: Algorithms & Data Structures
- **DeployDome**: DevOps & Infrastructure
- **BlockTropolis**: Web3 & Blockchain
- **NeuraVerse**: AI & Machine Learning
- **Pixelora**: UI/UX Design

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Authentication**: Custom OAuth hooks
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Authentication**: OAuth 2.0 (Google/GitHub) + JWT
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Integration**: Groq AI API
- **WebSocket**: Real-time communication
- **HTTP Client**: HTTPX

### Development Tools
- **Package Manager**: npm (frontend) / pip (backend)
- **Code Quality**: ESLint, TypeScript
- **Environment**: Node.js 18+ / Python 3.10+
- **Containerization**: Docker & Docker Compose

### Libraries & Dependencies

#### Frontend Dependencies
```json
{
  "@radix-ui/react-*": "^1.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "lucide-react": "^0.263.1",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "tailwind-merge": "^1.14.0",
  "tailwindcss-animate": "^1.0.7"
}
```

#### Backend Dependencies
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
python-dotenv==1.0.0
loguru==0.7.2
sqlalchemy==2.0.23
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+ and pip
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/Santhosh121805/planet-code-forge.git
cd planet-code-forge
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Start backend server
python main.py
```

### 4. Environment Configuration

Create .env in project root:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_API_BASE_URL=http://localhost:8000
```

Create .env:
```env
# Required
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret_minimum_256_bits

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OAUTH_REDIRECT_URL=http://localhost:3000
```

### 5. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
planet-code-forge/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── index.html
├── .env                          # Frontend environment
│
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── Navigation.tsx
│   │   ├── LoginModal.tsx
│   │   ├── DemoLoginModal.tsx
│   │   ├── CreateProfileModal.tsx
│   │   ├── MilkyWayGalaxy.tsx
│   │   ├── PlanetPreview.tsx
│   │   ├── DomainCard.tsx
│   │   └── AnalyzerPanel.tsx
│   │
│   ├── pages/                    # Page components
│   │   ├── Index.tsx
│   │   ├── DomainPlanet.tsx
│   │   ├── PersonalPlanetEvolution.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useRealTimeAnalysis.ts
│   │   └── use-mobile.tsx
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── utils.ts
│   │   ├── api.ts
│   │   └── mockDevelopers.ts
│   │
│   ├── assets/                   # Static assets
│   ├── App.tsx                   # Main App component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── backend/                      # Backend source
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Configuration
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Backend environment
│   ├── .env.example              # Environment template
│   │
│   ├── app/                      # Application modules
│   │   ├── __init__.py
│   │   ├── api/                  # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # OAuth authentication
│   │   │   ├── planet.py         # Planet generation
│   │   │   ├── stream.py         # WebSocket endpoints
│   │   │   └── evolution.py      # Planet evolution
│   │   │
│   │   ├── models/               # Database models
│   │   │   ├── __init__.py
│   │   │   └── database.py
│   │   │
│   │   └── services/             # Business logic
│   │       ├── __init__.py
│   │       ├── groq_ai.py        # AI integration
│   │       ├── genome_lab.py     # Code analysis
│   │       └── planet_builder.py # Planet generation
│   │
│   └── Dockerfile                # Backend container
│
├── docker-compose.yml            # Full stack deployment
├── Dockerfile.frontend           # Frontend container
│
├── docs/                         # Documentation
│   ├── OAUTH_SETUP.md           # OAuth configuration guide
│   ├── QUICKSTART.md            # Quick start guide
│   └── backend-architecture.ipynb # Architecture docs
│
└── scripts/                     # Utility scripts
    ├── start.sh                 # Unix start script
    └── start.bat                # Windows start script
```

## 🔧 Configuration

### OAuth Setup
1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000`

2. **GitHub OAuth**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create new OAuth App
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000`

3. **Groq AI**:
   - Get API key from [Groq Console](https://console.groq.com/)
   - Add to .env

### Database Setup
- **Development**: SQLite (no setup required)
- **Production**: Configure PostgreSQL in environment variables

## 🐳 Docker Deployment

### Quick Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Container Deployment
```bash
# Backend only
cd backend
docker build -t planet-forge-backend .
docker run -p 8000:8000 planet-forge-backend

# Frontend only
docker build -f Dockerfile.frontend -t planet-forge-frontend .
docker run -p 3000:80 planet-forge-frontend
```

## 🔍 API Documentation

### Authentication Endpoints
- `GET /auth/google` - Google OAuth login
- `GET /auth/github` - GitHub OAuth login
- `POST /auth/callback/google` - Google OAuth callback
- `POST /auth/callback/github` - GitHub OAuth callback

### Planet Endpoints
- `GET /api/planets/personal` - Get personal planet data
- `POST /api/planets/analyze` - Analyze code for planet generation
- `GET /api/planets/evolution/{user_id}` - Get planet evolution history

### WebSocket Endpoints
- `WS /stream/ws/{user_id}` - Real-time planet updates

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript/Python best practices
- Add tests for new features
- Update documentation
- Ensure responsive design
- Maintain accessibility standards

- demo -https://drive.google.com/file/d/1pDiev7RLB_-NkWJcDoJR6ejcgMSy3EDQ/view?usp=sharing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Groq** for AI integration
- **FastAPI** for robust backend framework
- **React** ecosystem for frontend development
- **Tailwind CSS** for styling system

## 🌟 Support

If you found this project helpful, please give it a ⭐!


---

**Transform your code into worlds, connect with developers across the galaxy! 🚀**
```

