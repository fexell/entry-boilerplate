using System;

using Entry.Auth.Models;

namespace Audwio.Projects;

public enum ProjectVisibility
{
    Public,
    Private
}

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string OwnerId { get; set; } = null!;
    public AppUser Owner { get; set; } = null!;

    public string Name { get; set; } = null!;

    // URL-safe, unique per owner — see SlugHelper.cs
    public string Slug { get; set; } = null!;

    public string? Description { get; set; }
    public string? Genre { get; set; }

    public ProjectVisibility Visibility { get; set; } = ProjectVisibility.Public;

    // Stores the license code from the frontend's LICENSES list
    // ("cc0", "cc-by", "cc-by-sa", ... or "none")
    public string? License { get; set; }

    // URL to the cover/artwork image (stored externally or as a data URL)
    public string? CoverImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}