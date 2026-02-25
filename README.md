# Ezra Full Stack Developer Take-Home Test

Objective: Build a small to-do task management API and frontend.

## Tech Stack

### Frontend
- **React** 18.2+ with **TypeScript**
- **Vite**

### Backend
- **.NET 8.0** (C#) - Migrated implementation (see [.NET Backend Migration](#net-backend-migration))

### DevOps
- **Docker** and **Docker Compose** for containerized local development
- Hot-reload enabled for frontend

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- Or, for manual setup:
  - **Node.js** 20+ and **npm**
  - **.NET SDK** 8.0+

## Quick Start with Docker (Recommended)

1. **Clone and enter the repository**
```bash
cd ezra-take-home-test
```

2. **Create local environment file**
```bash
cp .env.example .env
```

3. **Set a real JWT secret in `.env`**
- Update `JWT__SecretKey` with a strong random value (32+ characters).

4. **Start the application**
```bash
docker-compose up --build
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/swagger

## Manual Setup (Without Docker)

### Backend

1. **Install .NET 8 SDK (LTS)**
- Install the **8.x SDK specifically** (not latest 10.x): [Download .NET 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- Verify after install:
```bash
dotnet --list-sdks
```

2. **Navigate to backend directory**
```bash
cd backend/TaskManagement.Api
```

3. **Restore dependencies**
```bash
dotnet restore
```

4. **Set required environment variable**
```bash
export JWT__SecretKey="$(openssl rand -base64 64)"
```

5. **Run the application**
```bash
dotnet run
```

Manual setup note: `backend/TaskManagement.Api/.env.example` documents optional backend env overrides, but local `dotnet run` uses your current shell environment variables.

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

## Troubleshooting

### `POST /api/v1/auth/register` returns `500` during manual setup

From `backend/TaskManagement.Api`:

```bash
# Ensure JWT secret is present for this shell session
export JWT__SecretKey="$(openssl rand -base64 64)"

# Optional: show detailed error responses locally
export ASPNETCORE_ENVIRONMENT=Development

# Reset local SQLite database state
rm -f app.db

# Restore and rerun
dotnet restore
dotnet run
```

If it still fails, check backend terminal logs at the time of the request and use the exception message/stack trace to pinpoint the exact cause.

## Testing

### Backend

Run backend tests from the backend root:

```bash
cd backend
./run-tests.sh
```

This runs the .NET test suite inside Docker.

### Frontend

```bash
cd frontend
npm run test
```

## Code Formatting

This project uses:
- **Prettier** for frontend formatting
- **dotnet format** for backend formatting

### One-Time Setup
```bash
# From project root
pre-commit install
```

### Format Commands

```bash
# Frontend
cd frontend
npm run format

# Backend
cd backend/TaskManagement.Api
dotnet format
```

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

### Backend

1. Set a strong `JWT__SecretKey` in environment variables
2. Set `ASPNETCORE_ENVIRONMENT=Production`
3. Configure production database connection
4. Update `CORS:AllowedOrigins`

```bash
cd backend/TaskManagement.Api
dotnet publish -c Release -o ./publish
```

## .NET Backend Migration

This project was migrated from **FastAPI (Python)** to **.NET 8.0 (C#)** while maintaining API compatibility with the frontend.

See **[MIGRATION.md](MIGRATION.md)** for details on the original FastAPI implementation and migration approach.

## Assumptions

- Single-tenant task management app where authenticated users only manage their own tasks.
- Task workflow is intentionally simple and limited to `pending` and `completed`.
- Soft delete (`deleted_at`) is sufficient for this project scope.
- SQLite is acceptable for local development and take-home assessment scale.
- JWT access-token auth is sufficient for current scope (no refresh-token flow yet).

## Scalability Considerations

- Layered architecture (controllers/services/data) keeps business logic decoupled from storage and transport details.
- Current persistence layer can be migrated from SQLite to PostgreSQL/MySQL with limited service-layer impact.
- Stateless JWT authentication supports horizontal API scaling behind a load balancer.
- Task list pagination (`skip`/`limit`, max 100) prevents unbounded response sizes.
- Dockerized setup helps reproducible local/CI environments.

## Future Improvements

- Add refresh-token lifecycle (rotation/revocation) for stronger session management.
- Add rate limiting and brute-force protection on auth endpoints.
- Move production persistence to PostgreSQL with managed migrations.
- Add optimistic concurrency handling for conflicting task updates.
- Expand observability with structured logs, request correlation IDs, and metrics.
- Expand tests for additional edge cases (explicit clear semantics, pagination boundaries, case-insensitive email behavior).
- Add CI pipeline checks for lint/test/build on pull requests.
- Evaluate a framework upgrade path to `net10.0` in a dedicated pass once compatibility and dependency impacts are validated.

## License

MIT
