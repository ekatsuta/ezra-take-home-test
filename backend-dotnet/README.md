# Task Management API - .NET Core Backend

This is a .NET Core 8.0 Web API that provides the same functionality as the FastAPI backend, with 100% API compatibility.

## Quick Start

### Using Docker (Easiest)

From the project root:

```bash
docker-compose up --build
```

The API will be available at:
- API Base: http://localhost:8000
- Swagger UI: http://localhost:8000/swagger

### Manual Setup

#### Prerequisites

- .NET SDK 8.0 or higher ([Download](https://dotnet.microsoft.com/download))

#### Steps

1. **Navigate to the project directory**
   ```bash
   cd backend-dotnet/TaskManagement.Api
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Run the application**
   ```bash
   dotnet run
   ```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

## Configuration

Edit `appsettings.json` to configure:

- **JWT Secret Key**: Change the secret key for production
- **CORS Origins**: Add allowed frontend origins
- **Database**: SQLite database path (default: `app.db`)

Example:

```json
{
  "JWT": {
    "SecretKey": "your-secret-key-min-32-characters-long-change-in-production",
    "ExpirationMinutes": "30"
  },
  "CORS": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db"
  }
}
```

## API Endpoints

All endpoints are identical to the FastAPI version for frontend compatibility.

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `GET /api/v1/auth/me` - Get current user info (requires auth)

### Tasks
- `POST /api/v1/tasks` - Create a new task (requires auth)
- `GET /api/v1/tasks` - Get all user's tasks (requires auth)
- `PUT /api/v1/tasks/{id}` - Update a task (requires auth)
- `DELETE /api/v1/tasks/{id}` - Delete a task (requires auth)

## Project Structure

```
TaskManagement.Api/
├── Controllers/        # API endpoint controllers
│   ├── AuthController.cs
│   └── TasksController.cs
├── Models/             # Database entity models
│   ├── User.cs
│   └── TaskItem.cs
├── DTOs/               # Data Transfer Objects (request/response)
│   ├── UserDtos.cs
│   └── TaskDtos.cs
├── Services/           # Business logic layer
│   ├── IUserService.cs
│   ├── UserService.cs
│   ├── ITaskService.cs
│   ├── TaskService.cs
│   └── TokenService.cs
├── Data/               # EF Core DbContext
│   └── ApplicationDbContext.cs
├── Configuration/      # App configuration classes
│   └── JwtSettings.cs
├── Middleware/         # Custom middleware
│   └── ValidationExceptionMiddleware.cs
├── Program.cs          # Application entry point
└── appsettings.json    # Configuration file
```

## Architecture

The application follows a **clean layered architecture**:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Business logic and data validation
3. **Data Layer**: Database access via Entity Framework Core
4. **DTOs**: Request/response data transfer objects

### Dependency Injection

Services are registered in `Program.cs`:

```csharp
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<TokenService>();
```

## Running with Frontend

To connect the React frontend:

1. Start the .NET backend (it runs on port 5000 by default)
2. The frontend is already configured to work with `/api/v1` endpoints
3. Start the frontend application

**Using Docker:**
```bash
# From project root
docker-compose up --build
```

**Manually:**
```bash
# Terminal 1 - Backend
cd backend-dotnet/TaskManagement.Api
dotnet run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Development Commands

```bash
# Build the project
dotnet build

# Run with watch mode (auto-reload on changes)
dotnet watch run

# Clean build artifacts
dotnet clean

# Format code
dotnet format
```

## Database

The application uses **SQLite** with **Entity Framework Core**. The database is automatically created on first run.

### Reset Database

To reset the database:

```bash
rm app.db
dotnet run
```

The database schema will be recreated automatically.

### Database Migrations (Optional)

If you want to use EF Core migrations instead of auto-creation:

```bash
# Add migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

## Features

- **JWT Authentication**: Secure token-based authentication
- **BCrypt Password Hashing**: Industry-standard password security
- **Soft Deletes**: Data is marked as deleted, not removed
- **CORS Support**: Configured for frontend communication
- **Swagger UI**: Interactive API documentation
- **Entity Framework Core**: Type-safe database access
- **Async/Await**: Modern asynchronous patterns throughout

## Comparison with FastAPI

This .NET implementation provides:

✅ **Same API Contract** - Identical endpoints, requests, and responses
✅ **Compile-time Type Safety** - Errors caught before runtime
✅ **Better Performance** - Compiled code runs faster
✅ **Enterprise Features** - Built-in DI, logging, configuration
✅ **Strong Tooling** - Visual Studio, Rider, VS Code support

See [MIGRATION.md](../MIGRATION.md) for detailed comparison and migration guide.

## Production Deployment

For production:

1. **Update Configuration**
   - Set a strong JWT secret key
   - Configure production database connection
   - Update CORS origins
   - Set `ASPNETCORE_ENVIRONMENT=Production`

2. **Build for Production**
   ```bash
   dotnet publish -c Release -o ./publish
   ```

3. **Run Published App**
   ```bash
   cd publish
   dotnet TaskManagement.Api.dll
   ```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Database Locked

```bash
# Close all connections and restart
rm app.db
dotnet run
```

### CORS Errors

- Ensure the frontend URL is in `appsettings.json` under `CORS:AllowedOrigins`
- Verify the backend is running and accessible

## License

MIT
