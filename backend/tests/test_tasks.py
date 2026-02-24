import pytest
from fastapi import status
from datetime import datetime, UTC
from app.models.task import TaskStatus
from app.models.user import User
from app.utils.security import hash_password, create_access_token


class TestTaskEndpoints:
    """Test task endpoints with authentication."""

    def test_create_task(self, client, auth_headers, sample_user):
        """Test creating a task."""
        response = client.post(
            "/api/v1/tasks",
            headers=auth_headers,
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

    def test_create_task_no_description(self, client, auth_headers):
        """Test creating a task without description."""
        response = client.post(
            "/api/v1/tasks",
            headers=auth_headers,
            json={"title": "Just Title Task"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Just Title Task"
        assert data["description"] is None
        assert data["due_by"] is None

    def test_create_task_unauthorized(self, client):
        """Test creating a task without authentication."""
        response = client.post(
            "/api/v1/tasks",
            json={"title": "New Task"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_user_tasks(self, client, auth_headers, sample_user, sample_task):
        """Test getting all tasks for the authenticated user."""
        # Create another task
        client.post(
            "/api/v1/tasks",
            headers=auth_headers,
            json={"title": "Second Task"},
        )

        response = client.get("/api/v1/tasks", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(task["created_by"] == sample_user.id for task in data)

    def test_get_user_tasks_empty(self, client, auth_headers):
        """Test getting tasks when user has none."""
        response = client.get("/api/v1/tasks", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_update_task_title(self, client, auth_headers, sample_task):
        """Test updating a task's title."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers,
            json={"title": "Updated Title"},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == sample_task.description

    def test_update_task_status(self, client, auth_headers, sample_task):
        """Test updating a task's status."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers,
            json={"status": TaskStatus.COMPLETED.value},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == TaskStatus.COMPLETED.value

    def test_update_task_multiple_fields(self, client, auth_headers, sample_task):
        """Test updating multiple task fields."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            headers=auth_headers,
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

    def test_update_task_not_found(self, client, auth_headers):
        """Test updating a non-existent task."""
        response = client.put(
            "/api/v1/tasks/999", headers=auth_headers, json={"title": "Updated"}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_task_unauthorized(self, client, sample_task):
        """Test updating a task without authentication."""
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}", json={"title": "Updated"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_task_forbidden(self, client, sample_task, db_session):
        """Test that users cannot update other users' tasks."""
        # Create another user
        other_user = User(
            email="other@example.com",
            name="Other User",
            hashed_password=hash_password("password123"),
        )
        db_session.add(other_user)
        db_session.commit()
        db_session.refresh(other_user)

        # Create auth headers for the other user
        other_token = create_access_token(data={"sub": other_user.email})
        other_headers = {"Authorization": f"Bearer {other_token}"}

        # Try to update sample_task
        response = client.put(
            f"/api/v1/tasks/{sample_task.id}",
            headers=other_headers,
            json={"title": "Updated"},
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_task(self, client, auth_headers, sample_task):
        """Test deleting a task (soft delete)."""
        response = client.delete(
            f"/api/v1/tasks/{sample_task.id}", headers=auth_headers
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify task is soft deleted (not in list of tasks)
        get_response = client.get("/api/v1/tasks", headers=auth_headers)
        assert get_response.status_code == status.HTTP_200_OK
        tasks = get_response.json()
        assert len(tasks) == 0

    def test_delete_task_not_found(self, client, auth_headers):
        """Test deleting a non-existent task."""
        response = client.delete("/api/v1/tasks/999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task_unauthorized(self, client, sample_task):
        """Test deleting a task without authentication."""
        response = client.delete(f"/api/v1/tasks/{sample_task.id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_task_forbidden(self, client, sample_task, db_session):
        """Test that users cannot delete other users' tasks."""
        # Create another user
        other_user = User(
            email="other@example.com",
            name="Other User",
            hashed_password=hash_password("password123"),
        )
        db_session.add(other_user)
        db_session.commit()
        db_session.refresh(other_user)

        # Create auth headers for the other user
        other_token = create_access_token(data={"sub": other_user.email})
        other_headers = {"Authorization": f"Bearer {other_token}"}

        # Try to delete sample_task
        response = client.delete(
            f"/api/v1/tasks/{sample_task.id}", headers=other_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_deleted_task_not_in_user_tasks(
        self, client, auth_headers, sample_task, db_session
    ):
        """Test that soft-deleted tasks are not returned in user's task list."""
        # Soft delete the task
        sample_task.deleted_at = datetime.now(UTC)
        db_session.commit()

        response = client.get("/api/v1/tasks", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
