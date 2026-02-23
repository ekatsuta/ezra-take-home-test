import pytest
from fastapi import status
from datetime import datetime, UTC


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_user_success(self, client):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "securepassword123",
        }
        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "user" in data
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == user_data["email"]
        assert data["user"]["name"] == user_data["name"]
        assert "password" not in data["user"]
        assert "hashed_password" not in data["user"]

    def test_register_user_duplicate_email(self, client, sample_user):
        """Test registration with duplicate email."""
        user_data = {
            "email": sample_user.email,
            "name": "Another User",
            "password": "securepassword123",
        }
        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]

    def test_register_user_short_password(self, client):
        """Test registration with password too short."""
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "short",
        }
        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_user_invalid_email(self, client):
        """Test registration with invalid email format."""
        user_data = {
            "email": "notanemail",
            "name": "New User",
            "password": "securepassword123",
        }
        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_success(self, client, sample_user):
        """Test successful login."""
        login_data = {"email": sample_user.email, "password": "testpassword123"}
        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "user" in data
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == sample_user.email
        assert data["user"]["name"] == sample_user.name
        assert "password" not in data["user"]
        assert "hashed_password" not in data["user"]

    def test_login_invalid_email(self, client):
        """Test login with non-existent email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "testpassword123",
        }
        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_invalid_password(self, client, sample_user):
        """Test login with incorrect password."""
        login_data = {"email": sample_user.email, "password": "wrongpassword"}
        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info with valid token."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "email" in data
        assert "name" in data
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data

    def test_get_current_user_no_token(self, client):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalidtoken123"}
        response = client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserEndpoints:
    """Test user endpoints."""

    def test_get_user(self, client, sample_user):
        """Test getting a user by ID."""
        response = client.get(f"/api/v1/users/{sample_user.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_user.id
        assert data["email"] == sample_user.email
        assert data["name"] == sample_user.name

    def test_get_user_not_found(self, client):
        """Test getting a non-existent user."""
        response = client.get("/api/v1/users/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "User not found"

    def test_get_deleted_user(self, client, sample_user, db_session):
        """Test that soft-deleted users are not returned."""
        sample_user.deleted_at = datetime.now(UTC)
        db_session.commit()

        response = client.get(f"/api/v1/users/{sample_user.id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
