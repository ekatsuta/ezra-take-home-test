from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    """Base task schema with common fields."""

    title: str
    description: Optional[str] = None
    due_by: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task. All fields are optional."""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_by: Optional[datetime] = None


class TaskResponse(TaskBase):
    """Schema for task response."""

    id: int
    status: TaskStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
