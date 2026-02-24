using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Api.DTOs;

public record UserRegisterDto(
    [Required][EmailAddress] string Email,
    [Required] string Name,
    [Required][MinLength(6)] string Password
);

public record UserLoginDto(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record UserResponseDto(
    int Id,
    string Email,
    string Name,
    DateTime CreatedAt
);

public record TokenResponseDto(
    UserResponseDto User,
    string AccessToken,
    string TokenType
);

public record TokenData(string Email);
