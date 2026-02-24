using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;
using TaskManagement.Tests.Fixtures;
using Xunit;

namespace TaskManagement.Tests;

public class TasksControllerTests : IClassFixture<TestFixture>, IAsyncLifetime
{
    private readonly TestFixture _fixture;

    public TasksControllerTests(TestFixture fixture)
    {
        _fixture = fixture;
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await _fixture.ClearDatabaseAsync();
        // Clear auth headers for test isolation
        _fixture.Client.DefaultRequestHeaders.Authorization = null;
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsCreated()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var taskDto = new TaskCreateDto(
            Title: "New Task",
            Description: "Task description",
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PostAsJsonAsync("/api/v1/tasks", taskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var content = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        content.Should().NotBeNull();
        content!.Title.Should().Be("New Task");
        content.Description.Should().Be("Task description");
        content.Status.Should().Be(TaskManagement.Api.Models.TaskStatus.Pending);
        content.CreatedBy.Should().Be(user.Id);
    }

    [Fact]
    public async Task CreateTask_WithoutDescription_ReturnsCreated()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var taskDto = new TaskCreateDto(
            Title: "Just Title Task",
            Description: null,
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PostAsJsonAsync("/api/v1/tasks", taskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var content = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        content.Should().NotBeNull();
        content!.Title.Should().Be("Just Title Task");
        content.Description.Should().BeNull();
        content.DueBy.Should().BeNull();
    }

    [Fact]
    public async Task CreateTask_Unauthorized_ReturnsUnauthorized()
    {
        // Arrange
        var taskDto = new TaskCreateDto(
            Title: "New Task",
            Description: null,
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PostAsJsonAsync("/api/v1/tasks", taskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetUserTasks_ReturnsAllUserTasks()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        await _fixture.CreateSampleTaskAsync(user.Id);

        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Create a second task
        var taskDto = new TaskCreateDto(Title: "Second Task", Description: null, DueBy: null);
        await _fixture.Client.PostAsJsonAsync("/api/v1/tasks", taskDto);

        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/tasks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<List<TaskResponseDto>>();
        content.Should().NotBeNull();
        content!.Count.Should().Be(2);
        content.Should().OnlyContain(t => t.CreatedBy == user.Id);
    }

    [Fact]
    public async Task GetUserTasks_WhenNoTasks_ReturnsEmptyList()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/tasks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<List<TaskResponseDto>>();
        content.Should().NotBeNull();
        content!.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateTask_Title_ReturnsOk()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new TaskUpdateDto(
            Title: "Updated Title",
            Description: null,
            Status: null,
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/tasks/{task.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        content.Should().NotBeNull();
        content!.Title.Should().Be("Updated Title");
        content.Description.Should().Be(task.Description);
    }

    [Fact]
    public async Task UpdateTask_Status_ReturnsOk()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new TaskUpdateDto(
            Title: null,
            Description: null,
            Status: TaskManagement.Api.Models.TaskStatus.Completed,
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/tasks/{task.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        content.Should().NotBeNull();
        content!.Status.Should().Be(TaskManagement.Api.Models.TaskStatus.Completed);
    }

    [Fact]
    public async Task UpdateTask_MultipleFields_ReturnsOk()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new TaskUpdateDto(
            Title: "Updated Task",
            Description: "Updated Description",
            Status: TaskManagement.Api.Models.TaskStatus.Completed,
            DueBy: null
        );

        // Act
        var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/tasks/{task.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        content.Should().NotBeNull();
        content!.Title.Should().Be("Updated Task");
        content.Description.Should().Be("Updated Description");
        content.Status.Should().Be(TaskManagement.Api.Models.TaskStatus.Completed);
    }

    [Fact]
    public async Task UpdateTask_NotFound_ReturnsNotFound()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new TaskUpdateDto(Title: "Updated", Description: null, Status: null, DueBy: null);

        // Act
        var response = await _fixture.Client.PutAsJsonAsync("/api/v1/tasks/999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTask_Unauthorized_ReturnsUnauthorized()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);

        // Clear any auth headers from previous tests
        _fixture.Client.DefaultRequestHeaders.Authorization = null;

        var updateDto = new TaskUpdateDto(Title: "Updated", Description: null, Status: null, DueBy: null);

        // Act
        var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/tasks/{task.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateTask_OtherUserTask_ReturnsForbidden()
    {
        // Arrange
        var user1 = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user1.Id);

        // Create another user
        using var scope = _fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user2 = new User
        {
            Email = "other@example.com",
            Name = "Other User",
            HashedPassword = BCrypt.Net.BCrypt.HashPassword("password123"),
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user2);
        await context.SaveChangesAsync();

        // Clear any previous auth headers before setting user2's
        _fixture.Client.DefaultRequestHeaders.Authorization = null;
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user2);

        var updateDto = new TaskUpdateDto(Title: "Updated", Description: null, Status: null, DueBy: null);

        // Act
        var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/tasks/{task.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeleteTask_Success_ReturnsNoContent()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act
        var response = await _fixture.Client.DeleteAsync($"/api/v1/tasks/{task.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify task is not in list
        var getResponse = await _fixture.Client.GetAsync("/api/v1/tasks");
        var tasks = await getResponse.Content.ReadFromJsonAsync<List<TaskResponseDto>>();
        tasks.Should().BeEmpty();
    }

    [Fact]
    public async Task DeleteTask_NotFound_ReturnsNotFound()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act
        var response = await _fixture.Client.DeleteAsync("/api/v1/tasks/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTask_Unauthorized_ReturnsUnauthorized()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);

        // Clear any auth headers from previous tests
        _fixture.Client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _fixture.Client.DeleteAsync($"/api/v1/tasks/{task.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteTask_OtherUserTask_ReturnsForbidden()
    {
        // Arrange
        var user1 = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user1.Id);

        // Create another user
        using var scope = _fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user2 = new User
        {
            Email = "other@example.com",
            Name = "Other User",
            HashedPassword = BCrypt.Net.BCrypt.HashPassword("password123"),
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user2);
        await context.SaveChangesAsync();

        // Clear any previous auth headers before setting user2's
        _fixture.Client.DefaultRequestHeaders.Authorization = null;
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user2);

        // Act
        var response = await _fixture.Client.DeleteAsync($"/api/v1/tasks/{task.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task SoftDeletedTask_NotInUserTasksList()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);

        // Soft delete the task
        using var scope = _fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var dbTask = await context.Tasks.FindAsync(task.Id);
        dbTask!.DeletedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/tasks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var tasks = await response.Content.ReadFromJsonAsync<List<TaskResponseDto>>();
        tasks.Should().BeEmpty();
    }
}
