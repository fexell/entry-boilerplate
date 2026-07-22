

namespace Audwio.Projects
{
  public interface IProjectService
  {
    Task<ProjectResponse> CreateAsync(string ownerId, CreateProjectRequest request);
    Task<ProjectResponse?> GetBySlugAsync(string ownerUsername, string slug);
    Task<IReadOnlyList<ProjectResponse>> GetMyProjectsAsync(string ownerId);
    Task<IReadOnlyList<ProjectResponse>> GetPublicProjectsByUsernameAsync(string username);
    Task<ProjectResponse?> UpdateAsync(string ownerId, string ownerUsername, string slug, UpdateProjectRequest request);
    Task<bool> DeleteAsync(string ownerId, string ownerUsername, string slug, string password);
  }
}