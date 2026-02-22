from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    user_id: int,  # TODO: Replace with authenticated user from JWT
    db: Session = Depends(get_db),
):
    db_task = task_service.create_task(db, task, user_id)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


@router.get("/users/{user_id}/tasks", response_model=List[TaskResponse])
async def get_user_tasks(
    user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    tasks = task_service.get_tasks_by_user(db, user_id, skip, limit)
    return tasks


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)
):
    db_task = task_service.update_task(db, task_id, task_update)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    deleted = task_service.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    db.commit()
    return None
