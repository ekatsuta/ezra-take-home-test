from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID (excludes soft-deleted users)."""
    return db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    db_user = User(**user.model_dump())
    db.add(db_user)
    return db_user
