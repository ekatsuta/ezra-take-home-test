import pytest
from fastapi import status
from datetime import datetime, UTC
from app.models.task import TaskStatus


class TestTaskEndpoints:
    """Test task API endpoints."""

    def test_create_task(self, client, sample_user):
        """Test creating a new task."""
        response = client.post(
            "/api/v1/tasks",
            params={"user_id": sample_user.id},
            json={"title": "New Task", "description": "Task description"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "New Task"
        assert data["description"] == "Task description"
        assert data["status"] == TaskStatus.PENDING.value
        assert data["created_by"] == sample_user.id
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_minimal(self, client, sample_user):
        """Test creating a task with minimal fields."""
        response = client.post(
            "/api/v1/tasks",
            params={"user_id": sample_user.id},
            json={"title": "Minimal Task"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Minimal Task"
        assert data["description"] is None
        assert data["due_by"] is None

    def test_get_task(self, client, sample_task):
        """Test getting a task by ID."""
        response = client.get(f"/api/v1/tasks/{sample_task.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_task.id
        assert data["title"] == sample_task.title
        assert data["description"] == sample_task.description

    def test_get_task_not_found(self, client):
        """Test getting a non-existent task."""
        response = client.get("/api/v1/tasks/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Task not found"

    def test_get_user_tasks(self, client, sample_user, sample_task):
        """Test getting all tasks for a user."""
        # Create another task
        client.post(
            "/api/v1/tasks",
            params={"user_id": sample_user.id},
            json={"title": "Second Task"},
        )

        response = client.get(f"/api/v1/users/{sample_user.id}/tasks")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(task["created_by"] == sample_user.id for task in data)

    def test_get_user_tasks_empty(self, client, sample_user):
        """Test getting tasks for a user with no tasks."""
        response = client.get(f"/api/v1/users/{sample_user.id}/tasks")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_update_task_title(self, client, sample_task):
        """Test updating task title."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}", json={"title": "Updated Title"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == sample_task.description  # Unchanged

    def test_update_task_status(self, client, sample_task):
        """Test updating task status to completed."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json={"status": TaskStatus.COMPLETED.value},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == TaskStatus.COMPLETED.value

    def test_update_task_multiple_fields(self, client, sample_task):
        """Test updating multiple task fields."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            json={
                "title": "Updated Task",
                "description": "Updated Description",
                "status": TaskStatus.COMPLETED.value,
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Task"
        assert data["description"] == "Updated Description"
        assert data["status"] == TaskStatus.COMPLETED.value

    def test_update_task_not_found(self, client):
        """Test updating a non-existent task."""
        response = client.put("/api/v1/tasks/999", json={"title": "Updated"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task(self, client, sample_task):
        """Test soft deleting a task."""
        response = client.delete(f"/api/v1/tasks/{sample_task.id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify task is soft deleted (not returned)
        get_response = client.get(f"/api/v1/tasks/{sample_task.id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task_not_found(self, client):
        """Test deleting a non-existent task."""
        response = client.delete("/api/v1/tasks/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_deleted_task_not_in_user_tasks(
        self, client, sample_user, sample_task, db_session
    ):
        """Test that soft-deleted tasks don't appear in user's task list."""
        # Soft delete the task
        sample_task.deleted_at = datetime.now(UTC)
        db_session.commit()

        response = client.get(f"/api/v1/users/{sample_user.id}/tasks")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
