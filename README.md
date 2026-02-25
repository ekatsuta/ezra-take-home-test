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

1. **Install .NET SDK 8.0** ([Download](https://dotnet.microsoft.com/download))

2. **Navigate to backend directory**
```bash
cd backend/TaskManagement.Api
```

3. **Restore dependencies**
```bash
dotnet restore
```

4. **Set JWT secret (required)**
```bash
export JWT__SecretKey="replace-with-a-strong-random-secret-at-least-32-characters"
```

5. **Run the application**
```bash
dotnet run
```

Note: for Docker Compose, JWT settings are loaded from root `.env` (created from `.env.example`).

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

## License

MIT
