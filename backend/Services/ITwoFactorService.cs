

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public interface ITwoFactorService
  {
    Task<TwoFactorSetupResult> GetSetupInfoAsync(AppUser user);
    Task<bool> VerifyAndEnableAsync(AppUser user, string code);
    Task<IEnumerable<string>> GenerateRecoveryCodesAsync(AppUser user);
  }

  public record TwoFactorSetupResult(string SharedKey, string AuthenticatorUri);
}