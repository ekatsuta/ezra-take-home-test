# Ezra Full Stack Developer Take-Home Test

Objective: Build a small to-do task management API and frontend.

## Tech Stack

### Frontend
- **React** 18.2+ with **TypeScript**
- **Vite**

### Backend
- TO BE UPDATED

### DevOps
- **Docker** and **Docker Compose** for containerizations
- Hot-reload enabled for both frontend and backend

## Project Structure

```
.
├── frontend/                      # React TypeScript application
│   ├── src/
│   │   ├── components/            # React components (collocated structure)
│   │   │   ├── forms/             # Auth form components
│   │   │   │   ├── LoginForm/
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   └── RegisterForm/
│   │   │   │       └── RegisterForm.tsx
│   │   │   ├── tasks/             # Task management components
│   │   │   │   ├── TaskBoard/     # Main container with state/logic
│   │   │   │   │   ├── TaskBoard.tsx
│   │   │   │   │   └── TaskBoard.module.css
│   │   │   │   ├── TasksHeader/   # Task statistics header
│   │   │   │   │   ├── TasksHeader.tsx
│   │   │   │   │   └── TasksHeader.module.css
│   │   │   │   ├── TaskForm/      # Create task form
│   │   │   │   │   ├── TaskForm.tsx
│   │   │   │   │   └── TaskForm.module.css
│   │   │   │   ├── TaskFilterBar/ # Filter buttons
│   │   │   │   │   ├── TaskFilterBar.tsx
│   │   │   │   │   └── TaskFilterBar.module.css
│   │   │   │   ├── TaskList/      # Task list presentation
│   │   │   │   │   ├── TaskList.tsx
│   │   │   │   │   └── TaskList.module.css
│   │   │   │   ├── TaskCard/      # Task card container
│   │   │   │   │   └── TaskCard.tsx
│   │   │   │   ├── TaskItem/      # Task display component
│   │   │   │   │   ├── TaskItem.tsx
│   │   │   │   │   └── TaskItem.module.css
│   │   │   │   └── TaskEditForm/  # Edit task form
│   │   │   │       ├── TaskEditForm.tsx
│   │   │   │       └── TaskEditForm.module.css
│   │   │   └── ProtectedRoute/
│   │   │       └── ProtectedRoute.tsx
│   │   ├── pages/                 # Page components (collocated structure)
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── LoginPage.module.css
│   │   │   ├── RegisterPage/
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── RegisterPage.module.css
│   │   │   └── Dashboard/
│   │   │       ├── Dashboard.tsx
│   │   │       └── Dashboard.module.css
│   │   ├── contexts/              # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/              # API service layer
│   │   │   └── api.ts
│   │   ├── styles/                # Shared styles
│   │   │   └── forms.module.css
│   │   ├── utils/                 # Utility functions
│   │   │   ├── date.ts
│   │   │   └── apiErrors.ts
│   │   ├── types/                 # TypeScript types
│   │   │   └── index.ts
│   │   ├── test/                  # Test files
│   │   │   └── auth.test.tsx
│   │   ├── App.tsx                # Main application component
│   │   ├── App.css
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                       # FastAPI application
│   ├── app/
│   │   ├── models/                # Database models
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── routers/               # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   └── users.py
│   │   ├── schemas/               # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── auth.py
│   │   ├── services/              # Business logic layer
│   │   │   ├── user_service.py
│   │   │   └── task_service.py
│   │   ├── utils/                 # Utility functions
│   │   │   ├── auth.py
│   │   │   └── database.py
│   │   ├── config.py              # Configuration management
│   │   └── main.py                # Application entry point
│   ├── tests/                     # Test files
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── docker-compose.yml             # Docker orchestration
└── FASTAPI_TO_DOTNET_GUIDE.md     # Translation guide
```

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
   - API Documentation: http://localhost:8000/docs

### Manual Setup (Without Docker)

### Backend

1. **Navigate to backend directory**
  ```bash
  cd backend
  ```

2. **Create virtual environment**
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```

3. **Install dependencies**
  ```bash
  pip install -r requirements.txt
  ```

4. **Set up environment variables**
  ```bash
  cp .env.example .env
  # Edit .env and set SECRET_KEY
  ```

5. **Run the application**
  ```bash
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

#### Frontend

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

### Health Check
- **GET** `/api/v1/health` - Healthcheck endpoint

### Future Endpoints (To Be Implemented)
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

Now formatting runs automatically on every commit. You can also format manually:

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

## License

MIT

## Next Steps

- [ ] Add tests (frontend and backend)
- [ ] Translate to .NET (use the provided guide)
