using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IUserService _userService;

    public TasksController(ITaskService taskService, IUserService userService)
    {
        _taskService = taskService;
        _userService = userService;
    }

    private async Task<int?> GetCurrentUserIdAsync()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (email == null) return null;

        var user = await _userService.GetUserByEmailAsync(email);
        return user?.Id;
    }

    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        var task = await _taskService.CreateTaskAsync(request, userId.Value);

        var response = new TaskResponseDto(
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.CreatedAt,
            task.UpdatedAt,
            task.DueBy,
            task.CreatedBy
        );

        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTasks([FromQuery] int skip = 0, [FromQuery] int limit = 100)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        var normalizedSkip = Math.Max(0, skip);
        var normalizedLimit = Math.Clamp(limit, 1, 100);

        var tasks = await _taskService.GetTasksByUserAsync(userId.Value, normalizedSkip, normalizedLimit);

        var response = tasks.Select(t => new TaskResponseDto(
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.CreatedAt,
            t.UpdatedAt,
            t.DueBy,
            t.CreatedBy
        )).ToList();

        return Ok(response);
    }

    [HttpPut("{taskId}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateTask(int taskId, [FromBody] TaskUpdateDto request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        var task = await _taskService.GetTaskByIdAsync(taskId);
        if (task == null)
        {
            return NotFound(new { detail = "Task not found" });
        }

        if (task.CreatedBy != userId.Value)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                new { detail = "Not authorized to update this task" });
        }

        var updatedTask = await _taskService.UpdateTaskAsync(taskId, request);

        var response = new TaskResponseDto(
            updatedTask.Id,
            updatedTask.Title,
            updatedTask.Description,
            updatedTask.Status,
            updatedTask.CreatedAt,
            updatedTask.UpdatedAt,
            updatedTask.DueBy,
            updatedTask.CreatedBy
        );

        return Ok(response);
    }

    [HttpDelete("{taskId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
        {
            return Unauthorized(new { detail = "Could not validate credentials" });
        }

        var task = await _taskService.GetTaskByIdAsync(taskId);
        if (task == null)
        {
            return NotFound(new { detail = "Task not found" });
        }

        if (task.CreatedBy != userId.Value)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                new { detail = "Not authorized to delete this task" });
        }

        await _taskService.DeleteTaskAsync(taskId);

        return NoContent();
    }
}
