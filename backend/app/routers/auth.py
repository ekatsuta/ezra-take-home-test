from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse
from app.services import user_service
from app.utils.security import create_access_token
from app.utils.errors import (
    email_already_registered_exception,
    invalid_credentials_exception,
)
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter()


@router.post("/auth/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise email_already_registered_exception

    # Create user with hashed password
    db_user = user_service.create_user_with_password(db, user_data)
    db.commit()
    db.refresh(db_user)

    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )

    return {
        "user": UserResponse.model_validate(db_user),
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = user_service.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise invalid_credentials_exception

    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "user": UserResponse.model_validate(user),
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user
