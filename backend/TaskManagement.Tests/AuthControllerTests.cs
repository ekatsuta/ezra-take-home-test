using System.Net;
using FluentAssertions;
using TaskManagement.Api.DTOs;
using TaskManagement.Tests.Fixtures;
using Xunit;

namespace TaskManagement.Tests;

public class AuthControllerTests : IClassFixture<TestFixture>, IAsyncLifetime
{
    private readonly TestFixture _fixture;

    public AuthControllerTests(TestFixture fixture)
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
    public async Task Register_WithValidData_ReturnsCreatedWithTokenAndUser()
    {
        // Arrange
        var registerDto = new UserRegisterDto(
            Email: "newuser@example.com",
            Name: "New User",
            Password: "securepassword123"
        );

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var content = await _fixture.ReadJsonAsync<TokenResponseDto>(response.Content);
        content.Should().NotBeNull();
        content!.User.Email.Should().Be(registerDto.Email);
        content.User.Name.Should().Be(registerDto.Name);
        content.AccessToken.Should().NotBeNullOrEmpty();
        content.TokenType.Should().Be("bearer");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        await _fixture.CreateSampleUserAsync();
        var registerDto = new UserRegisterDto(
            Email: "test@example.com",
            Name: "Another User",
            Password: "securepassword123"
        );

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var error = await response.Content.ReadAsStringAsync();
        error.Should().Contain("Email already registered");
    }

    [Fact]
    public async Task Register_WithShortPassword_ReturnsUnprocessableEntity()
    {
        // Arrange
        var registerDto = new
        {
            Email = "newuser@example.com",
            Name = "New User",
            Password = "short"
        };

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsUnprocessableEntity()
    {
        // Arrange
        var registerDto = new
        {
            Email = "notanemail",
            Name = "New User",
            Password = "securepassword123"
        };

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithTokenAndUser()
    {
        // Arrange
        await _fixture.CreateSampleUserAsync();
        var loginDto = new UserLoginDto(
            Email: "test@example.com",
            Password: "testpassword123"
        );

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await _fixture.ReadJsonAsync<TokenResponseDto>(response.Content);
        content.Should().NotBeNull();
        content!.User.Email.Should().Be(loginDto.Email);
        content!.User.Name.Should().Be("Test User");
        content.AccessToken.Should().NotBeNullOrEmpty();
        content.TokenType.Should().Be("bearer");
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new UserLoginDto(
            Email: "nonexistent@example.com",
            Password: "testpassword123"
        );

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var error = await response.Content.ReadAsStringAsync();
        error.Should().Contain("Invalid email or password");
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        await _fixture.CreateSampleUserAsync();
        var loginDto = new UserLoginDto(
            Email: "test@example.com",
            Password: "wrongpassword"
        );

        // Act
        var response = await _fixture.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var error = await response.Content.ReadAsStringAsync();
        error.Should().Contain("Invalid email or password");
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ReturnsUserInfo()
    {
        // Arrange
        var user = await _fixture.CreateSampleUserAsync();
        _fixture.Client.DefaultRequestHeaders.Authorization = _fixture.GetAuthHeaders(user);

        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await _fixture.ReadJsonAsync<UserResponseDto>(response.Content);
        content.Should().NotBeNull();
        content!.Email.Should().Be(user.Email);
        content.Name.Should().Be(user.Name);
        content.Id.Should().Be(user.Id);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ReturnsUnauthorized()
    {
        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCurrentUser_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        _fixture.Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalidtoken123");

        // Act
        var response = await _fixture.Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
