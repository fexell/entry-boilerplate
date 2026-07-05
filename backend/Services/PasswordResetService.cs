using Microsoft.AspNetCore.Identity;
using System.Web;

using Entry.Auth.Models;
using Entry.Auth.Services;

namespace Entry.Auth.Services
{
  public class PasswordResetService : IPasswordResetService
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly IEmailService _emailSender;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public PasswordResetService(
      UserManager<AppUser> userManager,
      IEmailService emailSender,
      IConfiguration config,
      IWebHostEnvironment env
    )
    {
      _userManager = userManager;
      _emailSender = emailSender;
      _config = config;
      _env = env;
    }

    // ------------------------------------------------------
    // SEND RESET EMAIL
    // ------------------------------------------------------

    public async Task<bool> SendPasswordResetEmailAsync(AppUser user)
    {
      var token = await _userManager.GeneratePasswordResetTokenAsync(user);
      var encodedToken = HttpUtility.UrlEncode(token);

      var frontendUrl = _env.IsDevelopment() ? "http://localhost:3000" : _config["AppUrls:FrontendBaseUrl"];
      var resetLink = $"{frontendUrl}/auth/reset-password?userId={user.Id}&token={encodedToken}";

      var subject = "Reset your password";
      var body = $"""
      <p>We received a request to reset your password.</p>
      <p><a href="{resetLink}">Click here to reset your password</a></p>
      <p>If you did not make this request, you can ignore this email.</p>
      """;

      await _emailSender.SendAsync(user.Email!, subject, body);

      return true;
    }

    // ------------------------------------------------------
    // RESET PASSWORD
    // ------------------------------------------------------

    public async Task<bool> ResetPasswordAsync(AppUser user, string token, string newPassword)
    {
      var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

      if(!result.Succeeded) return false;

      await _userManager.UpdateSecurityStampAsync(user);

      return true;
    }
  }
}