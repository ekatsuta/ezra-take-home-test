# .NET Backend Tests

Unit and integration tests for the Task Management API, mirroring the FastAPI test suite.

## Running Tests

### Option 1: Using Docker (No .NET SDK required)

```bash
# From backend-dotnet directory
./run-tests.sh
```

### Option 2: With .NET SDK Installed

```bash
cd backend-dotnet
dotnet test
```

### Option 3: With Coverage

```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Test Structure

```
TaskManagement.Tests/
├── AuthControllerTests.cs     # Authentication endpoint tests
├── TasksControllerTests.cs    # Task CRUD endpoint tests
├── Fixtures/
│   └── TestFixture.cs         # Shared test fixtures
└── TestWebApplicationFactory.cs  # Test server setup
```

## Test Coverage

**Total: 26 tests, all passing ✅**

### AuthControllerTests (11 tests)
- ✅ User registration (success, duplicate email, validation)
- ✅ User login (success, invalid credentials)
- ✅ Get current user (with/without token, invalid token)

### TasksControllerTests (15 tests)
- ✅ Create tasks (with/without optional fields)
- ✅ Get user tasks (empty, multiple)
- ✅ Update tasks (partial/full updates)
- ✅ Delete tasks (soft delete)
- ✅ Authorization & permissions (unauthorized, forbidden)

## Technologies

- **xUnit** - Test framework with `IClassFixture` and `IAsyncLifetime` for setup/cleanup
- **FluentAssertions** - Fluent assertion library for readable test assertions
- **Microsoft.AspNetCore.Mvc.Testing** - Integration testing with `WebApplicationFactory`
- **EF Core InMemory Database** - Isolated test database (unique per test class for true isolation)

## Test Isolation

Tests are fully isolated using:
- **Unique in-memory databases** - Each test class gets its own database instance (via GUID in database name)
- **Database cleanup** - `IAsyncLifetime.DisposeAsync()` clears data after each test
- **Auth header cleanup** - HTTP client auth headers are cleared between tests
- **Scoped services** - Each database operation uses a fresh `DbContext` scope

This ensures tests can run in parallel without interference.

## Comparison with FastAPI Tests

These tests mirror the FastAPI test suite in `backend/tests/`:
- `test_auth.py` → `AuthControllerTests.cs`
- `test_tasks.py` → `TasksControllerTests.cs`
- `conftest.py` → `TestFixture.cs` + `TestWebApplicationFactory.cs`

Both test suites verify identical API behavior ensuring backend compatibility.
