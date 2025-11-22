#!/usr/bin/env python3
"""
Authentication API routes for Planet Code Forge with Google & GitHub OAuth
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import asyncio
import httpx

from ..models.database import User
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from config import load_config

config = load_config()

auth_router = APIRouter()
security = HTTPBearer(auto_error=False)

class LoginRequest(BaseModel):
    provider: str  # 'google' or 'github'
    code: Optional[str] = None  # OAuth authorization code
    wallet_address: Optional[str] = None
    email: Optional[str] = None
    username: str
    signature: Optional[str] = None  # For Web3 auth
    password: Optional[str] = None   # For traditional auth

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: str
    wallet_address: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    wallet_address: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: str
    created_at: datetime
    planets_count: int = 0

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=config.JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    """Get current authenticated user"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(credentials.credentials, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # TODO: Fetch user from database
    # For now, return a mock user
    return User(id=user_id, username=payload.get("username", "demo_user"))

@auth_router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    params = {
        "client_id": config.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{config.OAUTH_REDIRECT_URL}/",
        "scope": "openid email profile",
        "response_type": "code",
        "state": "google"
    }
    
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": auth_url}

@auth_router.get("/github/url")
async def get_github_auth_url():
    """Get GitHub OAuth authorization URL"""
    params = {
        "client_id": config.GITHUB_CLIENT_ID,
        "redirect_uri": f"{config.OAUTH_REDIRECT_URL}/",
        "scope": "user:email",
        "state": "github"
    }
    
    auth_url = "https://github.com/login/oauth/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": auth_url}

@auth_router.post("/google/token", response_model=AuthResponse)
async def google_oauth(request: LoginRequest):
    """Handle Google OAuth token exchange"""
    try:
        if not request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code required"
            )
        
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": config.GOOGLE_CLIENT_ID,
                    "client_secret": config.GOOGLE_CLIENT_SECRET,
                    "code": request.code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{config.OAUTH_REDIRECT_URL}/"
                }
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to exchange code for token: {token_response.text}"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            # Get user info
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user info"
                )
            
            user_data = user_response.json()
            
            # Create user ID and JWT token
            user_id = f"google_{user_data['id']}"
            jwt_token = create_access_token({
                "sub": user_id,
                "email": user_data["email"],
                "username": user_data.get("name", user_data["email"].split("@")[0]),
                "provider": "google"
            })
            
            return AuthResponse(
                access_token=jwt_token,
                user_id=user_id,
                username=user_data.get("name", user_data["email"].split("@")[0]),
                email=user_data["email"],
                avatar_url=user_data.get("picture"),
                provider="google"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth failed: {str(e)}"
        )

@auth_router.post("/github/token", response_model=AuthResponse)
async def github_oauth(request: LoginRequest):
    """Handle GitHub OAuth token exchange"""
    try:
        if not request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code required"
            )
        
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": config.GITHUB_CLIENT_ID,
                    "client_secret": config.GITHUB_CLIENT_SECRET,
                    "code": request.code,
                },
                headers={"Accept": "application/json"}
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to exchange code for token: {token_response.text}"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No access token received from GitHub"
                )
            
            # Get user info
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user info"
                )
            
            user_data = user_response.json()
            
            # Get user email (may be private)
            email = None
            try:
                email_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary_email = next((e for e in emails if e.get("primary")), None)
                    if primary_email:
                        email = primary_email["email"]
            except:
                pass  # Email is optional
            
            # Create user ID and JWT token
            user_id = f"github_{user_data['id']}"
            jwt_token = create_access_token({
                "sub": user_id,
                "email": email,
                "username": user_data.get("login"),
                "provider": "github"
            })
            
            return AuthResponse(
                access_token=jwt_token,
                user_id=user_id,
                username=user_data.get("login"),
                email=email,
                avatar_url=user_data.get("avatar_url"),
                provider="github"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GitHub OAuth failed: {str(e)}"
        )

@auth_router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login with OAuth providers or traditional credentials
    """
    try:
        if request.provider == "google":
            return await google_oauth(request)
        elif request.provider == "github":
            return await github_oauth(request)
        
        # Web3 wallet authentication
        elif request.wallet_address and request.signature:
            user_id = f"web3_{request.wallet_address[:10]}"
            
            access_token = create_access_token(data={"sub": user_id, "wallet": request.wallet_address})
            
            return AuthResponse(
                access_token=access_token,
                user_id=user_id,
                username=request.username,
                wallet_address=request.wallet_address,
                provider="web3"
            )
        
        # Traditional email/password authentication
        elif request.email and request.password:
            user_id = f"email_{request.email.split('@')[0]}"
            
            access_token = create_access_token(data={"sub": user_id, "email": request.email})
            
            return AuthResponse(
                access_token=access_token,
                user_id=user_id,
                username=request.username,
                email=request.email,
                provider="email"
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valid provider (google/github), wallet_address with signature, or email with password required"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

@auth_router.post("/register", response_model=AuthResponse)
async def register(request: LoginRequest):
    """
    Register new user with OAuth or traditional method
    """
    try:
        # TODO: Check if user already exists
        # TODO: Create user in database
        
        # For now, return same as login
        return await login(request)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@auth_router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    """
    try:
        # TODO: Get user data from database including planet count
        
        return UserProfile(
            id=str(current_user.id),
            username=current_user.username,
            display_name=current_user.username,
            provider="unknown",
            created_at=datetime.utcnow(),
            planets_count=1  # Mock data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

@auth_router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """
    Verify if token is valid
    """
    return {"valid": True, "user_id": str(current_user.id)}