from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.routers import health, tasks, auth
from app.utils.errors import validation_exception_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="Task Management API",
    description="A simple task management API built with FastAPI",
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Task Management API",
        "version": "1.0.0",
        "docs": "/docs",
    }
