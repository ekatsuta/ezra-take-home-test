# Ezra Full Stack Developer Take-Home Test

Objective: Build a small to-do task management API and frontend.

## Tech Stack

### Frontend
- **React** 18.2+ with **TypeScript**
- **Vite**

### Backend
- **FastAPI** (Python) - Original implementation
- **.NET Core 8.0** (C#) - Migrated implementation (see [.NET Backend Migration](#net-backend-migration))

### DevOps
- **Docker** and **Docker Compose** for containerizations
- Hot-reload enabled for both frontend and backend

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- Or, for manual setup:
  - **Node.js** 20+ and **npm**
  - **Python** 3.11+

## Quick Start with Docker (Recommended)

1. **Clone the repository**
  ```bash
  cd ezra-take-home-test
  ```

2. **Start the application**
  ```bash
  docker-compose up --build
  ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/swagger

### Manual Setup (Without Docker)

### Backend

1. **Install .NET SDK 8.0** ([Download](https://dotnet.microsoft.com/download))

2. **Navigate to backend directory**
  ```bash
  cd backend-dotnet/TaskManagement.Api
  ```

3. **Restore dependencies**
  ```bash
  dotnet restore
  ```

4. **Run the application**
  ```bash
  dotnet run
  ```

### Frontend

1. **Navigate to frontend directory**
  ```bash
  cd frontend
  ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Run the development server**
  ```bash
  npm run dev
  ```

## API Endpoints

- **POST** `/api/v1/auth/register` - User registration
- **POST** `/api/v1/auth/login` - User login
- **GET** `/api/v1/tasks` - Get all tasks
- **POST** `/api/v1/tasks` - Create a task
- **PUT** `/api/v1/tasks/{id}` - Update a task
- **DELETE** `/api/v1/tasks/{id}` - Delete a task

## Testing

### Backend

**Setup (one-time):**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -e .  # Install package in editable mode
```

**Run tests:**
```bash
# Make sure you're in the backend directory with venv activated
pytest

# With verbose output
pytest -v

# With coverage
pytest --cov=app
```

**Or run tests in Docker:**
```bash
docker-compose exec backend pytest
```

### Frontend
```bash
cd frontend
npm run test
```

## Code Formatting

This project uses **Prettier** (frontend) and **Black** (backend) with automated pre-commit hooks.

### One-Time Setup
```bash
# From project root
pre-commit install
```

**Frontend:** `npm run format` (from frontend/)
**Backend:** `black .` (from backend/)

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

### Backend
Ensure you:
1. Set a strong `SECRET_KEY` in production
2. Set `DEBUG=False`
3. Configure production database
4. Use a production ASGI server (uvicorn with workers)

## .NET Backend Migration

This project has been migrated from **FastAPI (Python)** to **.NET Core 8.0 (C#)** while maintaining 100% API compatibility with the frontend. See **[MIGRATION.md](MIGRATION.md)** for details on the initial FastAPI implementation and how it was translated into .NET.

## License

MIT

---
