from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate, UserRegister
from app.utils.security import hash_password, verify_password


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID (excludes soft-deleted users)."""
    return db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email (excludes soft-deleted users)."""
    return db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    db_user = User(**user.model_dump())
    db.add(db_user)
    return db_user


def create_user_with_password(db: Session, user_data: UserRegister) -> User:
    """Create a new user with hashed password."""
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password. Returns None if authentication fails."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
