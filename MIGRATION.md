# FastAPI to .NET Core Migration Documentation (Historical document - FastAPI backend has been removed)

## Summary

This document outlines the complete migration of the Task Management API from FastAPI (Python) to .NET Core 8.0 (C#), preserving all functionality while leveraging .NET's enterprise-grade features and type safety. I initially built the API in FastAPI, as it's the Python framework I'm most familiar with and allowed me to move quickly on the core logic. I then used Claude Code to assist with migrating the implementation to .NET, ensuring the translation was accurate and idiomatic to C#/.NET conventions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack Comparison](#technology-stack-comparison)
3. [Data Structure Design](#data-structure-design)
4. [API Design](#api-design)
5. [Frontend-Backend Communication](#frontend-backend-communication)
6. [Migration Details](#migration-details)
7. [Trade-offs and Assumptions](#trade-offs-and-assumptions)
8. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### FastAPI Architecture (Original)

```
backend/
├── app/
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # SQLAlchemy setup
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic validation schemas
│   ├── routers/             # API endpoint handlers
│   ├── services/            # Business logic layer
│   ├── dependencies/        # Dependency injection
│   └── utils/               # Utilities (security, errors)
```

### .NET Core Architecture (Migrated)

```
backend-dotnet/
└── TaskManagement.Api/
    ├── Program.cs           # Application entry point & DI setup
    ├── appsettings.json     # Configuration
    ├── Controllers/         # API endpoint handlers
    ├── Models/              # EF Core entity models
    ├── DTOs/                # Data Transfer Objects (validation)
    ├── Services/            # Business logic layer
    ├── Data/                # EF Core DbContext
    ├── Configuration/       # Configuration classes
    └── Middleware/          # Custom middleware
```

**Design Pattern**: Both implementations follow a **layered architecture** with clear separation of concerns:
- **Controller/Router Layer**: HTTP request/response handling
- **Service Layer**: Business logic and validation
- **Data Layer**: Database access through ORM
- **DTOs/Schemas**: Request/response validation

---

## Technology Stack Comparison

### Database & ORM

| Component | FastAPI | .NET Core |
|-----------|---------|-----------|
| **ORM** | SQLAlchemy 2.0 | Entity Framework Core 8.0 |
| **Database** | SQLite 3 | SQLite 3 |
| **Schema Creation** | `Base.metadata.create_all()` | `EnsureCreated()` |
| **Query Language** | SQLAlchemy ORM | LINQ (Language Integrated Query) |
| **Connection Pooling** | SQLAlchemy engine | Built-in connection pooling |

### Authentication & Security

| Component | FastAPI | .NET Core |
|-----------|---------|-----------|
| **JWT Library** | python-jose | System.IdentityModel.Tokens.Jwt |
| **Password Hashing** | passlib + bcrypt | BCrypt.Net |
| **Auth Middleware** | Custom dependency | Microsoft.AspNetCore.Authentication.JwtBearer |
| **CORS** | fastapi.middleware.cors | Built-in CORS middleware |

### Validation & Serialization

| Component | FastAPI | .NET Core |
|-----------|---------|-----------|
| **Request Validation** | Pydantic v2 | Data Annotations + Model Binding |
| **Response Serialization** | Pydantic models | System.Text.Json |
| **Email Validation** | pydantic.EmailStr | EmailAddressAttribute |
| **Type Coercion** | Automatic (Pydantic) | Automatic (Model Binder) |

### Testing

| Component | FastAPI | .NET Core |
|-----------|---------|-----------|
| **Test Framework** | pytest 7.4+ | xUnit 2.6 |
| **Test Client** | TestClient (Starlette) | WebApplicationFactory |
| **Test Database** | SQLite (file-based) | EF Core InMemory |
| **Coverage Tool** | pytest-cov | dotnet test --collect |

---

## Data Structure Design

#### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL  -- Soft delete
);
```

#### Tasks Table

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_by TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,  -- Soft delete
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### Entity Models

#### FastAPI (SQLAlchemy)

```python
# backend/app/models/user.py
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    tasks = relationship("Task", back_populates="creator")
```

#### .NET Core (EF Core)

```csharp
// backend-dotnet/TaskManagement.Api/Models/User.cs
[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Column("name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("hashed_password")]
    public string HashedPassword { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation property
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
```

**Key Design Decisions**:

1. **Soft Deletes**: Use `deleted_at` timestamps instead of hard deletes for data recovery and audit trails
2. **UTC Timestamps**: All timestamps stored in UTC for consistency across timezones
3. **Cascade Deletes**: Tasks are deleted when their creator is deleted

---

### Request/Response DTOs

#### FastAPI (Pydantic)

```python
# backend/app/schemas/user.py
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
```

#### .NET Core (Records + Data Annotations)

```csharp
// backend-dotnet/TaskManagement.Api/DTOs/UserDtos.cs
public record UserRegisterDto(
    [Required][EmailAddress] string Email,
    [Required] string Name,
    [Required][MinLength(6)] string Password
);

public record UserResponseDto(
    int Id,
    string Email,
    string Name,
    DateTime CreatedAt
);
```

**Design Choices**:

1. **C# Records**: Immutable DTOs with value equality (similar to Python dataclasses)
2. **Data Annotations**: Built-in validation attributes
3. **Nullable Reference Types**: C# 12 feature for null safety (similar to Python's Optional)

### Authentication & Authorization

Both implementations use **JWT (JSON Web Tokens)** with the same structure:

#### JWT Token Structure

```json
{
  "sub": "user@example.com",
  "email": "user@example.com",
  "nameidentifier": "123",
  "exp": 1234567890,
  "iss": "TaskManagementApi",
  "aud": "TaskManagementClient"
}
```

#### Password Hashing

Both use **bcrypt** with adaptive rounds:

**FastAPI**:
```python
pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)
hashed = pwd_context.hash(password)
is_valid = pwd_context.verify(password, hashed)
```

**.NET Core**:
```csharp
string hashed = BCrypt.Net.BCrypt.HashPassword(password);
bool isValid = BCrypt.Net.BCrypt.Verify(password, hashed);
```

---

## Frontend-Backend Communication

### CORS Configuration

#### FastAPI

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### .NET Core

```csharp
// backend-dotnet/TaskManagement.Api/Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
```

### Error Response Format

Both backends return errors in the same format:

```json
{
  "detail": "Error message here"
}
```

---

## Migration Details

### 1. Project Structure Translation

| FastAPI Concept | .NET Core Equivalent | Notes |
|-----------------|---------------------|-------|
| `main.py` | `Program.cs` | Application entry point |
| Pydantic schemas | DTOs with Data Annotations | Request/response validation |
| `@router.get()` | `[HttpGet]` attribute | Route declaration |
| `Depends()` | Constructor injection | Dependency injection |
| SQLAlchemy models | EF Core entities | ORM models |
| `SessionLocal` | `DbContext` scoped service | Database session management |

### 2. Dependency Injection

#### FastAPI (Function-based)

```python
# backend/app/routers/tasks.py
@router.post("/tasks")
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ...
```

#### .NET Core (Constructor-based)

```csharp
// backend-dotnet/TaskManagement.Api/Controllers/TasksController.cs
[Authorize]
[ApiController]
[Route("api/v1/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IUserService _userService;

    public TasksController(ITaskService taskService, IUserService userService)
    {
        _taskService = taskService;
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto request)
    {
        // ...
    }
}
```

---

## Testing Strategy

Both FastAPI and .NET implementations include comprehensive test suites that verify identical API behavior.

### Test Infrastructure Comparison

#### FastAPI Testing Setup

```python
# backend/tests/conftest.py
@pytest.fixture
def client():
    # Create test database
    engine = create_engine("sqlite:///./test.db")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Override dependency
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client

    # Cleanup
    Base.metadata.drop_all(bind=engine)
```

#### .NET Testing Setup

```csharp
// TaskManagement.Tests/TestWebApplicationFactory.cs
public class TestWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>
    where TProgram : class
{
    private readonly string _databaseName;

    public TestWebApplicationFactory()
    {
        // Use unique database name per instance for test isolation
        _databaseName = $"InMemoryDbForTesting_{Guid.NewGuid()}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove SQLite DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add InMemory database for testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
            });
        });
    }
}
```

**Key Difference**: .NET uses **unique in-memory databases per test class** (via GUID) to ensure complete test isolation and allow parallel execution without interference.

### Test Strategy

#### FastAPI
- **Database**: Creates/destroys SQLite test database per session
- **Cleanup**: `Base.metadata.drop_all()` after tests
- **Dependencies**: Override via `app.dependency_overrides`

#### .NET Core
- **Database**: Unique EF Core in-memory database per test class (GUID-based names)
- **Cleanup**: `IAsyncLifetime.DisposeAsync()` clears data after each test
- **Auth Headers**: Explicitly cleared between tests to prevent interference
- **Scoped Services**: Fresh `DbContext` scope for each database operation

**Critical .NET Testing Insight**: Using a unique database name per `TestWebApplicationFactory` instance was essential to prevent test interference when running in parallel. Initial implementation shared a single database name causing intermittent failures.

The test suites verify:
- ✅ Authentication flows (register, login, token validation)
- ✅ Task CRUD operations (create, read, update, delete)
- ✅ Authorization (user isolation, forbidden access)
- ✅ Validation (email format, password length, required fields)
- ✅ Soft deletes (tasks don't appear after deletion)
- ✅ Error handling (404, 401, 403, 400 status codes)
