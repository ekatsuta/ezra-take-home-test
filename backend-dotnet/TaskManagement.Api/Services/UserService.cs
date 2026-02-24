using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .Where(u => u.Email == email && u.DeletedAt == null)
            .FirstOrDefaultAsync();
    }

    public async Task<User> CreateUserAsync(UserRegisterDto userDto)
    {
        var user = new User
        {
            Email = userDto.Email,
            Name = userDto.Name,
            HashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User?> AuthenticateUserAsync(string email, string password)
    {
        var user = await GetUserByEmailAsync(email);

        if (user == null)
            return null;

        bool isValidPassword = BCrypt.Net.BCrypt.Verify(password, user.HashedPassword);

        return isValidPassword ? user : null;
    }
}
