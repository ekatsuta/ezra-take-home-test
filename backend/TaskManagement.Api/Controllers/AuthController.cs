using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly TokenService _tokenService;

    public AuthController(IUserService userService, TokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
    {
        // Check if email already exists
        var existingUser = await _userService.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { detail = "Email already registered" });
        }

        // Create user
        var user = await _userService.CreateUserAsync(request);

        // Generate token
        var token = _tokenService.GenerateToken(user);

        var response = new TokenResponseDto(
            User: new UserResponseDto(user.Id, user.Email, user.Name, user.CreatedAt),
            AccessToken: token,
            TokenType: "bearer"
        );

        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] UserLoginDto request)
    {
        var user = await _userService.AuthenticateUserAsync(request.Email, request.Password);

        if (user == null)
        {
            return Unauthorized(new { detail = "Invalid email or password" });
        }

        // Generate token
        var token = _tokenService.GenerateToken(user);

        var response = new TokenResponseDto(
            User: new UserResponseDto(user.Id, user.Email, user.Name, user.CreatedAt),
            AccessToken: token,
            TokenType: "bearer"
        );

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (email == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        var user = await _userService.GetUserByEmailAsync(email);

        if (user == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        return Ok(new UserResponseDto(user.Id, user.Email, user.Name, user.CreatedAt));
    }
}
