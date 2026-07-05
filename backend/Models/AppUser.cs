using Microsoft.AspNetCore.Identity;

namespace Entry.Auth.Models
{
  public class AppUser : IdentityUser
  {
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Optional profile fields (used in UserMeDto)
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public bool Premium { get; set; } = false;

    // Navigation property for refresh tokens
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    // Optional fields for email verification
    public DateTime? LastVerificationEmailSentAt { get; set; }

    public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
  }
}
