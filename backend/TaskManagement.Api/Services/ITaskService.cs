using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public interface ITaskService
{
    Task<TaskItem> CreateTaskAsync(TaskCreateDto taskDto, int userId);
    Task<List<TaskItem>> GetTasksByUserAsync(int userId, int skip = 0, int limit = 100);
    Task<TaskItem?> GetTaskByIdAsync(int taskId);
    Task<TaskItem> UpdateTaskAsync(int taskId, TaskUpdateDto taskDto);
    Task DeleteTaskAsync(int taskId);
}
