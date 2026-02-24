using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.Api.Models;

[Table("tasks")]
public class TaskItem
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = TaskStatus.Pending;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("due_by")]
    public DateTime? DueBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Required]
    [Column("created_by")]
    public int CreatedBy { get; set; }

    // Navigation property
    [ForeignKey("CreatedBy")]
    public User? Creator { get; set; }
}

public static class TaskStatus
{
    public const string Pending = "pending";
    public const string Completed = "completed";
}
