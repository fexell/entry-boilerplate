

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public interface IPasswordResetService
  {
    Task<bool> SendPasswordResetEmailAsync(AppUser user);
    Task<bool> ResetPasswordAsync(AppUser user, string token, string newPassword);
  }
}