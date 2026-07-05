using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class VerificationEmailService : IVerificationEmailService
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly IEmailService _emailService;
    private IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly TimeSpan _tokenLifespan;

    private static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);

    public VerificationEmailService(
      UserManager<AppUser> userManager,
      IEmailService emailService,
      IConfiguration config,
      IWebHostEnvironment env,
      IOptions<DataProtectionTokenProviderOptions> tokenOptions
    )
    {
      _userManager = userManager;
      _emailService = emailService;
      _config = config;
      _env = env;
      _tokenLifespan = tokenOptions.Value.TokenLifespan;
    }

    public async Task<bool> SendVerificationEmailAsync(AppUser user)
    {
      var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
      var baseUrl = _env.IsDevelopment() ? "http://localhost:3000" : _config["AppUrls:FrontendBaseUrl"];
      var link = $"{baseUrl}/auth/verify-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";
      var resendLink = $"{baseUrl}/auth/resend-verification";

      if(_env.IsDevelopment())
      {
        Console.WriteLine($"EMAIL VERIFICATION TOKEN:");
        Console.WriteLine(token);
        Console.WriteLine($"EMAIL VERIFICATION LINK:");
        Console.WriteLine(link);
      }

      var expiryText = FormatLifespan(_tokenLifespan);

      await _emailService.SendAsync(
        user.Email!,
        "Verify your email",
        $@"<p>Please verify your email by clicking the link below:</p>
           <p><a href='{link}'>Verify Email</a></p>
           <p>This link will expire in {expiryText}.</p>
           <p>If it has expired, you can request a new one here: <a href='{resendLink}'>Resend verification email</a></p>"
      );

      user.LastVerificationEmailSentAt = DateTime.UtcNow;
      await _userManager.UpdateAsync(user);

      return true;
    }

    public async Task<(bool Sent, TimeSpan? RetryAfter)> TryResendVerificationEmailAsync(AppUser user)
    {
      if(user.EmailConfirmed) return (false, null);

      if(user.LastVerificationEmailSentAt is DateTime last)
      {
        var elapsed = DateTime.UtcNow - last;
        if(elapsed < ResendCooldown) return (false, ResendCooldown - elapsed);
      }

      await SendVerificationEmailAsync(user);
      return (true, null);
    }

    private static string FormatLifespan(TimeSpan span)
    {
      if(span.TotalDays >= 1)
        return span.TotalDays == 1 ? "1 day" : $"{(int)span.TotalDays} days";

      if(span.TotalHours >= 1)
        return span.TotalHours == 1 ? "1 hour" : $"{(int)span.TotalHours} hours";

      return span.TotalMinutes == 1 ? "1 minute" : $"{(int)span.TotalMinutes} minutes";
    }
  }
}
