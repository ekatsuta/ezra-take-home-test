from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for creating a new user (admin use)."""

    pass


class UserRegister(UserBase):
    """Schema for user registration."""

    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for JWT token payload data."""

    email: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
