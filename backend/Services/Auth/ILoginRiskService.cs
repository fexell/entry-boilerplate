

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public interface ILoginRiskService
  {
    Task<LoginRiskAssessment> EvaluateAsync(AppUser? user, string ip, string? deviceFingerprint);
    Task SendSuspiciousLoginEmailAsync(AppUser user, LoginRiskAssessment assessment);
    Task<string?> GetCountryFromIpAsync(string ip);
  }
}