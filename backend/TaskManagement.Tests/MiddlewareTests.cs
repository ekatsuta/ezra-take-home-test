using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using TaskManagement.Tests.Fixtures;
using Xunit;

namespace TaskManagement.Tests;

public class MiddlewareTests : IClassFixture<TestFixture>, IAsyncLifetime
{
    private readonly TestFixture _fixture;

    public MiddlewareTests(TestFixture fixture)
    {
        _fixture = fixture;
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await _fixture.ClearDatabaseAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = null;
    }

    [Fact]
    public async Task NotFoundError_ReturnsTaskNotFoundMessage()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new { title = "Updated" };

        // Act - try to update non-existent task
        var response = await _fixture.PutAsJsonAsync("/api/v1/tasks/99999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        json.RootElement.TryGetProperty("detail", out var detail).Should().BeTrue();
        detail.GetString().Should().Be("Task not found");
    }

    [Fact]
    public async Task ValidationError_ReturnsSafeMessage()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        var task = await _fixture.CreateSampleTaskAsync(user.Id);
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act - send invalid status value
        var invalidJson = "{\"status\": \"invalid_status\"}";
        var content = new StringContent(invalidJson, Encoding.UTF8, "application/json");
        var response = await _fixture.Client.PutAsync($"/api/v1/tasks/{task.Id}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var responseContent = await response.Content.ReadAsStringAsync();

        // Should return safe error message, not internal details
        responseContent.Should().NotContain("ArgumentException");
        responseContent.Should().NotContain("StackTrace");
    }

    [Fact]
    public async Task HandledErrors_DoNotIncludeExceptionDetails()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new { title = "Updated" };

        // Act - this error is handled by controller and should not include exception metadata
        var response = await _fixture.PutAsJsonAsync("/api/v1/tasks/99999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var content = await response.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(content);

        json.RootElement.TryGetProperty("detail", out var detail).Should().BeTrue();
        detail.GetString().Should().Be("Task not found");

        json.RootElement.TryGetProperty("exceptionType", out _).Should().BeFalse();
        json.RootElement.TryGetProperty("exceptionMessage", out _).Should().BeFalse();
    }

    [Fact]
    public async Task ErrorResponses_DoNotExposeInternalDetails()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        var updateDto = new { title = "Updated" };

        // Act - try to update non-existent task
        var response = await _fixture.PutAsJsonAsync("/api/v1/tasks/99999", updateDto);

        // Assert
        var content = await response.Content.ReadAsStringAsync();

        var json = JsonDocument.Parse(content);
        json.RootElement.TryGetProperty("detail", out var detail).Should().BeTrue();
        detail.GetString().Should().Be("Task not found");

        detail.GetString().Should().NotContain("sqlite");
        detail.GetString().Should().NotContain("Database");
    }
}
