using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audwio.Projects
{
  [ApiController]
  [Route("api/[controller]")]
  public class ProjectsController : ControllerBase
  {
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
      _projectService = projectService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProjects()
    {
      var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(ownerId))
        return Unauthorized(new { message = "Not authenticated.", errors = Array.Empty<string>() });

      var projects = await _projectService.GetMyProjectsAsync(ownerId);
      return Ok(projects);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
      var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if(string.IsNullOrEmpty(ownerId))
        return Unauthorized(new { message = "Not authenticated.", errors = Array.Empty<string>() });

      var result = await _projectService.CreateAsync(ownerId, request);

      return CreatedAtAction(
        nameof(GetBySlug),
        new { owner = result.OwnerUsername, slug = result.Slug},
        result
      );
    }

    [HttpGet("{owner}/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string owner, string slug)
    {
      var project = await _projectService.GetBySlugAsync(owner, slug);

      if(project is null)
        return NotFound(new { message = "Project not found.", errors = Array.Empty<string>() });

      // TODO: once Visibility === "private" is enforced, check ownership/collaborator
      // access here before returning — currently anyone can fetch a private project's slug URL.

      return Ok(project);
    }

    [HttpGet("{username}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicByUsername(string username)
    {
      var projects = await _projectService.GetPublicProjectsByUsernameAsync(username);
      return Ok(projects);
    }

    [HttpPatch("{owner}/{slug}")]
    [Authorize]
    public async Task<IActionResult> Update(string owner, string slug, [FromBody] UpdateProjectRequest request)
    {
      var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(ownerId))
        return Unauthorized(new { message = "Not authenticated.", errors = Array.Empty<string>() });

      var result = await _projectService.UpdateAsync(ownerId, owner, slug, request);

      if (result is null)
        return NotFound(new { message = "Project not found.", errors = Array.Empty<string>() });

      return Ok(result);
    }

    [HttpDelete("{owner}/{slug}")]
    [Authorize]
    public async Task<IActionResult> Delete(string owner, string slug, [FromBody] DeleteProjectRequest request)
    {
      var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(ownerId))
        return Unauthorized(new { message = "Not authenticated.", errors = Array.Empty<string>() });

      var deleted = await _projectService.DeleteAsync(ownerId, owner, slug, request.Password);

      if (!deleted)
        return BadRequest(new { message = "Incorrect password or project not found.", errors = new[] { "Incorrect password or project not found." } });

      return NoContent();
    }
  }
}