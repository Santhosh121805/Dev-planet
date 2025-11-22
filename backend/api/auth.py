#!/usr/bin/env python3
"""
Authentication API endpoints for Planet Code Forge
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from web3 import Web3
from eth_account import Account
import httpx
from loguru import logger

from models.database import User, SessionLocal
from config import config

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserLogin(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None

class WalletLogin(BaseModel):
    wallet_address: str
    signature: str
    message: str

class GoogleLogin(BaseModel):
    google_token: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str]
    wallet_address: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# JWT functions
def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(seconds=config.JWT_EXPIRATION)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(to_encode, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)

def verify_token(token: str) -> str:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current user from JWT token"""
    user_id = verify_token(credentials.credentials)
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
    finally:
        db.close()

# Authentication endpoints

@router.post("/wallet-login", response_model=TokenResponse)
async def wallet_login(login_data: WalletLogin):
    """Web3 wallet authentication"""
    
    try:
        # Verify wallet signature
        message = login_data.message
        signature = login_data.signature
        wallet_address = login_data.wallet_address.lower()
        
        # Verify the signature using web3
        recovered_address = Account.recover_message(
            text=message,
            signature=signature
        ).lower()
        
        if recovered_address != wallet_address:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid wallet signature"
            )
        
        # Check if user exists or create new one
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.wallet_address == wallet_address).first()
            
            if not user:
                # Create new user
                username = f"planet_{wallet_address[:8]}"
                user = User(
                    wallet_address=wallet_address,
                    username=username
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                logger.info(f"🎆 New user created via wallet: {wallet_address}")
            
            # Generate access token
            access_token = create_access_token(str(user.id))
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=str(user.id),
                    username=user.username,
                    email=user.email,
                    wallet_address=user.wallet_address,
                    avatar_url=user.avatar_url,
                    created_at=user.created_at
                )
            )
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Wallet login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet authentication failed"
        )

@router.post("/google-login", response_model=TokenResponse)
async def google_login(login_data: GoogleLogin):
    """Google OAuth authentication"""
    
    try:
        # Verify Google token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={login_data.google_token}"
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            google_data = response.json()
            
            # Get user info from Google
            user_response = await client.get(
                f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={login_data.google_token}"
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get Google user info"
                )
            
            user_info = user_response.json()
        
        email = user_info.get('email')
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google account"
            )
        
        # Check if user exists or create new one
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            
            if not user:
                # Create new user
                username = user_info.get('name', f"user_{email.split('@')[0]}")
                user = User(
                    email=email,
                    username=username,
                    avatar_url=user_info.get('picture')
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                logger.info(f"🎆 New user created via Google: {email}")
            
            # Generate access token
            access_token = create_access_token(str(user.id))
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=str(user.id),
                    username=user.username,
                    email=user.email,
                    wallet_address=user.wallet_address,
                    avatar_url=user.avatar_url,
                    created_at=user.created_at
                )
            )
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        wallet_address=current_user.wallet_address,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """User logout (token invalidation would be handled by client)"""
    
    return {
        "message": "Logged out successfully",
        "user_id": str(current_user.id)
    }

@router.get("/wallet-message/{wallet_address}")
async def get_wallet_message(wallet_address: str):
    """Get message for wallet signature"""
    
    timestamp = int(datetime.utcnow().timestamp())
    message = f"Sign this message to authenticate with Planet Code Forge.\n\nWallet: {wallet_address}\nTimestamp: {timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees."
    
    return {
        "message": message,
        "timestamp": timestamp
    }