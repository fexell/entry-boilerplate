using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Entry.Auth.Data;
using Entry.Auth.Models;

namespace Audwio.Projects
{
  public class ProjectService : IProjectService
  {
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public ProjectService(AppDbContext db, UserManager<AppUser> userManager)
    {
      _db = db;
      _userManager = userManager;
    }

    public async Task<ProjectResponse> CreateAsync(string ownerId, CreateProjectRequest request)
    {
      var owner = await _db.Users.FirstOrDefaultAsync(u => u.Id == ownerId)
        ?? throw new InvalidOperationException($"Owner not found.");

      var baseSlug = SlugHelper.Slugify(request.Name);
      var slug = await GenerateUniqueSlugAsync(ownerId, baseSlug);

      var project = new Project
      {
        OwnerId = ownerId,
        Name = request.Name.Trim(),
        Slug = slug,
        Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
        Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre,
        Visibility = request.Visibility == "private" ? ProjectVisibility.Private : ProjectVisibility.Public,
        License = string.IsNullOrWhiteSpace(request.License) || request.License == "none" ? null : request.License,
      };

      _db.Projects.Add(project);
      await _db.SaveChangesAsync();

      return ToResponse(project, owner.UserName);
    }

    public async Task<ProjectResponse?> GetBySlugAsync(string ownerUsername, string slug)
    {
      var project = await _db.Projects
        .Include(p => p.Owner)
        .FirstOrDefaultAsync(p => p.Owner.UserName == ownerUsername && p.Slug == slug);

      return project is null ? null : ToResponse(project, project.Owner.UserName!);
    }

    public async Task<IReadOnlyList<ProjectResponse>> GetMyProjectsAsync(string ownerId)
    {
      var projects = await _db.Projects
        .Include(p => p.Owner)
        .Where(p => p.OwnerId == ownerId)
        .OrderByDescending(p => p.UpdatedAt)
        .ToListAsync();

      return projects.Select(p => ToResponse(p, p.Owner.UserName!)).ToList();
    }

    public async Task<IReadOnlyList<ProjectResponse>> GetPublicProjectsByUsernameAsync(string username)
    {
      var projects = await _db.Projects
        .Include(p => p.Owner)
        .Where(p => p.Owner.UserName == username && p.Visibility == ProjectVisibility.Public)
        .OrderByDescending(p => p.UpdatedAt)
        .ToListAsync();

      return projects.Select(p => ToResponse(p, p.Owner.UserName!)).ToList();
    }

    public async Task<ProjectResponse?> UpdateAsync(string ownerId, string ownerUsername, string slug, UpdateProjectRequest request)
    {
      var project = await _db.Projects
        .Include(p => p.Owner)
        .FirstOrDefaultAsync(p => p.OwnerId == ownerId && p.Slug == slug);

      if (project is null) return null;

      if (!string.IsNullOrWhiteSpace(request.Name))
      {
        var newName = request.Name.Trim();
        var newBaseSlug = SlugHelper.Slugify(newName);

        // Only regenerate slug if name actually changed
        if (newName != project.Name)
        {
          project.Name = newName;
          project.Slug = await GenerateUniqueSlugAsync(ownerId, newBaseSlug, excludeSlug: slug);
        }
      }

      if (request.Description != null)
        project.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

      if (request.Genre != null)
        project.Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre;

      if (request.Visibility != null)
        project.Visibility = request.Visibility == "private" ? ProjectVisibility.Private : ProjectVisibility.Public;

      if (request.License != null)
        project.License = string.IsNullOrWhiteSpace(request.License) || request.License == "none" ? null : request.License;

      if (request.CoverImageUrl != null)
        project.CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl) ? null : request.CoverImageUrl.Trim();

      project.UpdatedAt = DateTime.UtcNow;

      await _db.SaveChangesAsync();

      return ToResponse(project, ownerUsername);
    }

    public async Task<bool> DeleteAsync(string ownerId, string ownerUsername, string slug, string password)
    {
      var user = await _userManager.FindByIdAsync(ownerId);
      if (user is null) return false;

      var passwordValid = await _userManager.CheckPasswordAsync(user, password);
      if (!passwordValid) return false;

      var project = await _db.Projects
        .FirstOrDefaultAsync(p => p.OwnerId == ownerId && p.Slug == slug);

      if (project is null) return false;

      _db.Projects.Remove(project);
      await _db.SaveChangesAsync();
      return true;
    }

    public async Task<string> GenerateUniqueSlugAsync(string ownerId, string baseSlug, string? excludeSlug = null)
    {
      var slug = baseSlug;
      var suffix = 2;

      while(await _db.Projects.AnyAsync(p => p.OwnerId == ownerId && p.Slug == slug && p.Slug != excludeSlug))
      {
        slug = $"{baseSlug}-{suffix}";
        suffix++;
      }

      return slug;
    }

    private static ProjectResponse ToResponse(Project project, string ownerUsername) => new()
    {
      Id = project.Id,
      Name = project.Name,
      Slug = project.Slug,
      OwnerUsername = ownerUsername,
      Description = project.Description,
      Genre = project.Genre,
      Visibility = project.Visibility == ProjectVisibility.Private ? "private" : "public",
      License = project.License,
      CoverImageUrl = project.CoverImageUrl,
      CreatedAt = project.CreatedAt
    };
  }
}