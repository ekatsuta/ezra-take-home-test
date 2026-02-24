using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Api.DTOs;

public record TaskCreateDto(
    [Required] string Title,
    string? Description,
    DateTime? DueBy
);

public record TaskUpdateDto(
    string? Title,
    string? Description,
    string? Status,
    DateTime? DueBy
);

public record TaskResponseDto(
    int Id,
    string Title,
    string? Description,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? DueBy,
    int CreatedBy
);
