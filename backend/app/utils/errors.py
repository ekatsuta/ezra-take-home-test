from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
):
    """Format validation errors into user-friendly messages."""
    errors = exc.errors()
    error_messages = []

    for error in errors:
        loc = error.get("loc", [])
        field = ".".join(str(x) for x in loc if x != "body") or "field"
        msg = error.get("msg", "Invalid value")

        if "ctx" in error and "reason" in error["ctx"]:
            error_messages.append(f"{field}: {error['ctx']['reason']}")
        else:
            error_messages.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": error_messages},
    )


# Authentication errors
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

invalid_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect email or password",
    headers={"WWW-Authenticate": "Bearer"},
)

email_already_registered_exception = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Email already registered",
)

# Task errors
task_not_found_exception = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Task not found",
)

task_forbidden_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Not authorized to access this task",
)
