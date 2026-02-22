import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.task import Task, TaskStatus


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create tables
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client(db_session):
    """Create a test client with dependency override."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_task(db_session, sample_user):
    """Create a sample task for testing."""
    task = Task(
        title="Test Task",
        description="Test Description",
        status=TaskStatus.PENDING,
        created_by=sample_user.id,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task
