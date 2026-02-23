"""Tests for validation error handling."""
import pytest
from fastapi.testclient import TestClient


def test_validation_error_invalid_email(client: TestClient):
    """Test that validation errors return formatted array for invalid email."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid@email",  # Missing TLD
            "name": "Test User",
            "password": "testpass123",
        },
    )

    assert response.status_code == 422
    data = response.json()

    # Should return detail as an array
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) > 0

    # Verify exact error message format
    error_message = data["detail"][0]
    assert (
        error_message
        == "email: The part after the @-sign is not valid. It should have a period."
    )


def test_validation_error_missing_field(client: TestClient):
    """Test validation errors for missing required fields."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            # Missing name and password
        },
    )

    assert response.status_code == 422
    data = response.json()

    # Should return detail as an array with 2 errors
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) == 2


def test_validation_error_short_password(client: TestClient):
    """Test validation errors for password too short."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "short",  # Less than 8 characters
        },
    )

    assert response.status_code == 422
    data = response.json()

    # Should return detail as an array
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) == 1

    # Verify exact error message
    error_message = data["detail"][0]
    assert (
        error_message
        == "password: Value error, Password must be at least 8 characters long"
    )
