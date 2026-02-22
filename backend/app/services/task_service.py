from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, UTC
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    """Get task by ID (excludes soft-deleted tasks)."""
    return db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()


def get_tasks_by_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[Task]:
    """Get all tasks for a user (excludes soft-deleted tasks)."""
    return (
        db.query(Task)
        .filter(Task.created_by == user_id, Task.deleted_at.is_(None))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    """Create a new task."""
    db_task = Task(**task.model_dump(), created_by=user_id)
    db.add(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """Update a task. Returns None if task not found."""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return None

    # Update only fields that were provided
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """Soft delete a task. Returns True if deleted, False if not found."""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return False

    db_task.deleted_at = datetime.now(UTC)
    return True
