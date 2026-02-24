from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.utils.errors import task_not_found_exception, task_forbidden_exception

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task for the authenticated user."""
    db_task = task_service.create_task(db, task, current_user.id)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/tasks", response_model=List[TaskResponse])
async def get_user_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks for the authenticated user."""
    tasks = task_service.get_tasks_by_user(db, current_user.id, skip, limit)
    return tasks


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task. Users can only update their own tasks."""
    db_task = task_service.get_task_by_id(db, task_id)
    if not db_task:
        raise task_not_found_exception
    if db_task.created_by != current_user.id:
        raise task_forbidden_exception

    db_task = task_service.update_task(db, task_id, task_update)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task (soft delete). Users can only delete their own tasks."""
    db_task = task_service.get_task_by_id(db, task_id)
    if not db_task:
        raise task_not_found_exception
    if db_task.created_by != current_user.id:
        raise task_forbidden_exception

    task_service.delete_task(db, task_id)
    db.commit()
    return None
