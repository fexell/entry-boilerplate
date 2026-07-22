using System;
using System.ComponentModel.DataAnnotations;

namespace Audwio.Projects
{
  public class CreateProjectRequest
  {
    [Required(ErrorMessage = "Project name is required.")]
    [MaxLength(100, ErrorMessage = "Project name cannot be longer than 100 characters.")]
    public string Name { get; set; } = null!;

    [MaxLength(350, ErrorMessage = "Project description cannot be longer than 350 characters.")]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Genre { get; set; }

    [Required(ErrorMessage = "Project visibility is required.")]
    [RegularExpression("^(public|private)$", ErrorMessage = "Visibility must be 'public' or 'private'.")]
    public string Visibility { get; set; } = null!;

    public string? License { get; set; }
  }

  public class UpdateProjectRequest
  {
    [MaxLength(100, ErrorMessage = "Project name cannot be longer than 100 characters.")]
    public string? Name { get; set; }

    [MaxLength(350, ErrorMessage = "Project description cannot be longer than 350 characters.")]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Genre { get; set; }

    [RegularExpression("^(public|private)$", ErrorMessage = "Visibility must be 'public' or 'private'.")]
    public string? Visibility { get; set; }

    public string? License { get; set; }

    [MaxLength(2048)]
    public string? CoverImageUrl { get; set; }
  }

  public class DeleteProjectRequest
  {
    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = null!;
  }

  public class ProjectResponse
  {
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string OwnerUsername { get; set; } = null!;
    public string? Description { get; set; }
    public string? Genre { get; set; }
    public string Visibility { get; set; } = null!;
    public string? License { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
  }
}