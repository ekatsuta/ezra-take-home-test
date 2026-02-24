using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Tests.Fixtures;

public class TestFixture : IDisposable
{
    public HttpClient Client { get; }
    public TestWebApplicationFactory<Program> Factory { get; }
    public JsonSerializerOptions JsonOptions { get; }

    public TestFixture()
    {
        Environment.SetEnvironmentVariable(
            "JWT__SecretKey",
            "test-secret-key-at-least-32-characters-long");

        JsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        JsonOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));

        Factory = new TestWebApplicationFactory<Program>();
        Client = Factory.CreateClient();
    }

    public Task<HttpResponseMessage> PostAsJsonAsync<T>(string requestUri, T value)
    {
        return Client.PostAsync(requestUri, JsonContent.Create(value, options: JsonOptions));
    }

    public Task<HttpResponseMessage> PutAsJsonAsync<T>(string requestUri, T value)
    {
        return Client.PutAsync(requestUri, JsonContent.Create(value, options: JsonOptions));
    }

    public Task<T?> ReadJsonAsync<T>(HttpContent content)
    {
        return content.ReadFromJsonAsync<T>(JsonOptions);
    }

    public async Task<User> CreateSampleUserAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user = new User
        {
            Email = "test@example.com",
            Name = "Test User",
            HashedPassword = BCrypt.Net.BCrypt.HashPassword("testpassword123"),
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<TaskItem> CreateSampleTaskAsync(int userId)
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var task = new TaskItem
        {
            Title = "Test Task",
            Description = "Test Description",
            Status = TaskManagement.Api.Models.TaskStatus.Pending,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        return task;
    }

    public AuthenticationHeaderValue GetAuthHeaders(User user)
    {
        using var scope = Factory.Services.CreateScope();
        var tokenService = scope.ServiceProvider.GetRequiredService<TokenService>();
        var token = tokenService.GenerateToken(user);

        return new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task ClearDatabaseAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        context.Tasks.RemoveRange(context.Tasks);
        context.Users.RemoveRange(context.Users);
        await context.SaveChangesAsync();
    }

    public void Dispose()
    {
        Client?.Dispose();
        Factory?.Dispose();
    }
}
