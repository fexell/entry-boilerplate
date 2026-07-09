using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Entry.Auth.Data;
using Entry.Auth.Models;
using Entry.Auth.DTOs;

namespace Entry.Auth.Services
{
  public class UserService : IUserService
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly IVerificationEmailService _verificationEmailService;
    private readonly IRefreshTokenService _refreshTokenService;

    public UserService(
      UserManager<AppUser> userManager,
      IVerificationEmailService verificationEmailService,
      IRefreshTokenService refreshTokenService
    )
    {
      _userManager = userManager;
      _verificationEmailService = verificationEmailService;
      _refreshTokenService = refreshTokenService;
    }

    // ------------------------------------------------------
    // GET USER
    // ------------------------------------------------------

    public async Task<AppUser?> GetByIdAsync(string userId)
    {
      return await _userManager.Users
        .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<AppUser?> GetByEmailAsync(string email)
    {
      return await _userManager.Users
        .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<AppUser?> GetByUsernameAsync(string username)
    {
      return await _userManager.Users
        .FirstOrDefaultAsync(u => u.UserName == username);
    }

    // ------------------------------------------------------
    // UPDATE USER
    // ------------------------------------------------------

    public async Task<bool> UpdateUserAsync(AppUser user, UserUpdateDto dto)
    {
      var updated = false;

      if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.UserName)
      {
        user.UserName = dto.Username;
        await _userManager.UpdateNormalizedUserNameAsync(user);
        updated = true;
      }

      if(dto.FirstName != null && dto.FirstName != user.FirstName)
      {
        user.FirstName = dto.FirstName;
        updated = true;
      }

      if(dto.LastName != null && dto.LastName != user.LastName)
      {
        user.LastName = dto.LastName;
        updated = true;
      }

      if (!updated) return true;

      var result = await _userManager.UpdateAsync(user);

      return result.Succeeded;
    }

    // ------------------------------------------------------
    // DELETE USER
    // ------------------------------------------------------

    public async Task<UserDeleteResult> DeleteUserAsync(AppUser user, string password)
    {
      var passwordValid = await _userManager.CheckPasswordAsync(user, password);

      if (!passwordValid) return UserDeleteResult.InvalidPassword;

      var result = await _userManager.DeleteAsync(user);

      return result.Succeeded ? UserDeleteResult.Success : UserDeleteResult.Failed;
    }

    // ------------------------------------------------------
    // EMAIL CONFIRMATION
    // ------------------------------------------------------

    public async Task<bool> IsEmailConfirmedAsync(AppUser user)
    {
      return await _userManager.IsEmailConfirmedAsync(user);
    }

    public async Task<string> GenerateEmailVerificationTokenAsync(AppUser user)
    {
      return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    public async Task<bool> VerifyEmailAsync(AppUser user, string token)
    {
      var result = await _userManager.ConfirmEmailAsync(user, token);
      return result.Succeeded;
    }

    // ------------------------------------------------------
    // PASSWORD CHANGE
    // ------------------------------------------------------

    public async Task<IdentityResult> ChangePasswordAsync(AppUser user, ChangePasswordDto dto)
    {
      return await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
    }

    // ------------------------------------------------------
    // USER ME DTO
    // ------------------------------------------------------

    public async Task<UserMeDto> GetUserMeAsync(AppUser user)
    {
      return new UserMeDto
      {
        Id = user.Id,
        Email = user.Email,
        Username = user.UserName,
        CreatedAt = user.CreatedAt,
        EmailConfirmed = user.EmailConfirmed,
        Avatar = user.Avatar,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Premium = user.Premium,
        TwoFactorEnabled = user.TwoFactorEnabled
      };
    }

    public Task<PublicUserDto> GetPublicUserAsync(AppUser user)
    {
      return Task.FromResult(new PublicUserDto
      {
        Id = user.Id,
        Username = user.UserName!,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Avatar = user.Avatar,
        CreatedAt = user.CreatedAt,
        Premium = user.Premium
      });
    }
  }
}
