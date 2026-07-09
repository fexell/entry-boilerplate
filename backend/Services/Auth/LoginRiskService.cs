

using Entry.Auth.Data;
using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class LoginRiskService : ILoginRiskService
  {
    private readonly IUserService _userService;
    private readonly AppDbContext _db;

    public LoginRiskService(IUserService userService, AppDbContext db)
    {
      _userService = userService;
      _db = db;
    }

    public async Task<LoginRiskAssessment> EvaluateAsync(
      AppUser? user,
      string ip,
      string? deviceFingerprint
    )
    {
      var country = await GetCountryFromIpAsync(ip);

      int score = 0;

      // -----------------------------------------
      // 1. NEW IP RANGE?
      // -----------------------------------------

      if(user != null && user.LastKnownIp != null && user.LastKnownIp != ip)
      {
        score += 30;
      }

      // -----------------------------------------
      // 2. NEW COUNTRY?
      // -----------------------------------------

      if(user != null && user.LastKnownCountry != null && user.LastKnownCountry != country)
      {
        score += 40;
      }

      // -----------------------------------------
      // 3. NEW DEVICE FINGERPRINT?
      // -----------------------------------------

      if(user != null && user.LastKnownDeviceFingerprint != null && user.LastKnownDeviceFingerprint != deviceFingerprint)
      {
        score += 30;
      }

      // -----------------------------------------
      // 4. UNUSUAL TIME?
      // -----------------------------------------

      var hour = DateTime.UtcNow.Hour;
      if(hour < 5 || hour > 23)
      {
        score += 10;
      }

      // -----------------------------------------
      // 5. RISK LEVEL
      // -----------------------------------------

      string level = score >= 70 ? "High" :
        score >= 30 ? "Medium" :
        "Low";

      var assessment = new LoginRiskAssessment
      {
        UserId = user?.Id,
        IpAddress = ip,
        Country = country,
        DeviceFingerprint = deviceFingerprint,
        RiskScore = score,
        RiskLevel = level
      };

      _db.LoginRiskAssessments.Add(assessment);
      await _db.SaveChangesAsync();

      return assessment;
    }

    public async Task<string?> GetCountryFromIpAsync(string ip)
    {
      var response = await new HttpClient().GetAsync($"https://ipapi.co/{ip}/country_name/");
      return await response.Content.ReadAsStringAsync();
    }
  }
}