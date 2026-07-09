using Microsoft.AspNetCore.Identity;

using Entry.Auth.Models;
using Entry.Auth.DTOs;

namespace Entry.Auth.Services
{
  public interface IUserService
  {
    Task<AppUser?> GetByIdAsync(string userId);
    Task<AppUser?> GetByEmailAsync(string email);
    Task<AppUser?> GetByUsernameAsync(string username);

    Task<bool> UpdateAsync(AppUser user);
    Task<bool> UpdateUserAsync(AppUser user, UserUpdateDto updateDto);
    Task<UserDeleteResult> DeleteUserAsync(AppUser user, string password);

    Task<bool> IsEmailConfirmedAsync(AppUser user);
    Task<string> GenerateEmailVerificationTokenAsync(AppUser user);
    Task<bool> VerifyEmailAsync(AppUser user, string token);

    Task<IdentityResult> ChangePasswordAsync(AppUser user, ChangePasswordDto dto);

    Task<UserMeDto> GetUserMeAsync(AppUser user);
    Task<PublicUserDto> GetPublicUserAsync(AppUser user);
  }
}
