from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Used by Docker, load balancers, and monitoring systems.
    """
    return {
        "status": "healthy",
        "message": "FastAPI backend is running successfully",
    }
