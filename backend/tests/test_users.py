import pytest
from fastapi import status
from datetime import datetime, UTC


class TestUserEndpoints:
    def test_create_user(self, client):
        response = client.post(
            "/api/v1/users", json={"email": "newuser@example.com", "name": "New User"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert "id" in data
        assert "created_at" in data

    def test_create_user_invalid_email(self, client):
        response = client.post(
            "/api/v1/users", json={"email": "invalid-email", "name": "Test User"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_user(self, client, sample_user):
        response = client.get(f"/api/v1/users/{sample_user.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_user.id
        assert data["email"] == sample_user.email
        assert data["name"] == sample_user.name

    def test_get_user_not_found(self, client):
        response = client.get("/api/v1/users/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "User not found"

    def test_get_deleted_user(self, client, sample_user, db_session):
        # Soft delete the user
        sample_user.deleted_at = datetime.now(UTC)
        db_session.commit()

        response = client.get(f"/api/v1/users/{sample_user.id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
