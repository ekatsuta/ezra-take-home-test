using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public interface IUserService
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(UserRegisterDto userDto);
    Task<User?> AuthenticateUserAsync(string email, string password);
}
