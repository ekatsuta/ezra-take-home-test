using System.ComponentModel.DataAnnotations;
using TaskStatus = TaskManagement.Api.Models.TaskStatus;

namespace TaskManagement.Api.DTOs;

public record TaskCreateDto(
    [Required] string Title,
    string? Description,
    DateTime? DueBy
);

public record TaskUpdateDto(
    string? Title,
    string? Description,
    TaskStatus? Status,
    DateTime? DueBy,
    bool ClearDueBy = false
);

public record TaskResponseDto(
    int Id,
    string Title,
    string? Description,
    TaskStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? DueBy,
    int CreatedBy
);
