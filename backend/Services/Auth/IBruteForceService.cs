

namespace Entry.Auth.Services
{
  public interface IBruteForceService
  {
    Task LogAsync(string endpoint, string ip, string? email, string? userId, bool success);
    Task<bool> IsIpBlocked(string ip);
    Task<bool> IsEmailBlocked(string email);
    Task<bool> IsUserBlocked(string userId);
  }
}