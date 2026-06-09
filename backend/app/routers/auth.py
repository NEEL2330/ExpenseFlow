import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models import User, LinkToken
from app.schemas import (
    GenerateLinkTokenResponse,
    LinkTelegramRequest,
    LinkStatusResponse,
    RegisterRequest,
    LoginRequest,
    AuthResponse
)
from app.deps import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Uses passlib with bcrypt<4.0 to avoid the 72-byte padding bug
    return pwd_context.hash(password)

@router.post("/generate-link-token", response_model=GenerateLinkTokenResponse)
def generate_link_token(db: Session = Depends(get_db)):
    """Generate a random token and return a Telegram deep link."""
    token_str = secrets.token_urlsafe(32)
    bot_username = os.getenv("TELEGRAM_BOT_USERNAME", "ExpenseMate")
    
    link_token = LinkToken(
        token=token_str,
        status="pending",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(link_token)
    db.commit()
    
    telegram_link = f"https://t.me/{bot_username}?start={token_str}"
    
    return GenerateLinkTokenResponse(
        token=token_str,
        telegram_link=telegram_link
    )

@router.post("/link-telegram")
def link_telegram(req: LinkTelegramRequest, db: Session = Depends(get_db)):
    """Internal endpoint called by the bot (or webhook) when user clicks Start."""
    token_record = db.query(LinkToken).filter(LinkToken.token == req.token).first()
    
    if not token_record:
        raise HTTPException(status_code=404, detail="Token not found")
        
    if token_record.status != "pending":
        raise HTTPException(status_code=400, detail="Token already used or expired")
        
    if datetime.utcnow() > token_record.expires_at:
        raise HTTPException(status_code=400, detail="Token expired")
        
    token_record.telegram_id = req.telegram_id
    token_record.telegram_username = req.telegram_username
    token_record.status = "linked"
    
    db.commit()
    return {"message": "Telegram account linked successfully"}

@router.get("/check-link-status/{token}", response_model=LinkStatusResponse)
def check_link_status(token: str, db: Session = Depends(get_db)):
    """Frontend polls this to check if user has clicked Start in Telegram."""
    token_record = db.query(LinkToken).filter(LinkToken.token == token).first()
    
    if not token_record:
        raise HTTPException(status_code=404, detail="Token not found")
        
    return LinkStatusResponse(
        linked=token_record.status == "linked",
        telegram_id=token_record.telegram_id,
        telegram_username=token_record.telegram_username
    )

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """Complete registration with username/password after Telegram is linked."""
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    # Verify token
    token_record = db.query(LinkToken).filter(LinkToken.token == req.token).first()
    if not token_record or token_record.status != "linked":
        raise HTTPException(status_code=400, detail="Invalid or unverified token")
        
    # Check if username exists
    existing_user = db.query(User).filter(User.username == req.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already exists")
        
    # Check if Telegram ID is already registered to someone else
    # BUT! We must consider that earlier versions of the app might have created
    # a User record just from telegram_id via the webhook without a username.
    # If such a user exists, we UPDATE it instead of creating a new one.
    existing_telegram_user = db.query(User).filter(User.telegram_id == token_record.telegram_id).first()
    
    if existing_telegram_user:
        if existing_telegram_user.username:
             raise HTTPException(status_code=409, detail="Telegram account already linked to another username")
        
        # Claim the existing Telegram-only user account
        user = existing_telegram_user
        user.username = req.username
        user.password_hash = get_password_hash(req.password)
        user.telegram_username = token_record.telegram_username
    else:
        # Create new user
        user = User(
            telegram_id=token_record.telegram_id,
            username=req.username,
            password_hash=get_password_hash(req.password),
            telegram_username=token_record.telegram_username,
            name=token_record.telegram_username # default name to telegram username if available
        )
        db.add(user)
        
    # Delete token since it's been used
    db.delete(token_record)
    db.commit()
    
    return {"message": "User registered successfully"}

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT."""
    user = db.query(User).filter(User.username == req.username).first()
    
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )
