using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem> CreateTaskAsync(TaskCreateDto taskDto, int userId)
    {
        var task = new TaskItem
        {
            Title = taskDto.Title,
            Description = taskDto.Description,
            DueBy = taskDto.DueBy,
            CreatedBy = userId,
            Status = Models.TaskStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<List<TaskItem>> GetTasksByUserAsync(int userId, int skip = 0, int limit = 100)
    {
        return await _context.Tasks
            .Where(t => t.CreatedBy == userId && t.DeletedAt == null)
            .OrderByDescending(t => t.CreatedAt)
            .Skip(skip)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetTaskByIdAsync(int taskId)
    {
        return await _context.Tasks
            .Where(t => t.Id == taskId && t.DeletedAt == null)
            .FirstOrDefaultAsync();
    }

    public async Task<TaskItem> UpdateTaskAsync(int taskId, TaskUpdateDto taskDto)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        if (taskDto.Title != null)
            task.Title = taskDto.Title;

        if (taskDto.Description != null)
            task.Description = taskDto.Description;

        if (taskDto.Status != null)
            task.Status = taskDto.Status;

        if (taskDto.DueBy.HasValue)
            task.DueBy = taskDto.DueBy;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return task;
    }

    public async Task DeleteTaskAsync(int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        // Soft delete
        task.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
