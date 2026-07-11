using Microsoft.Extensions.Caching.Memory;

using Entry.Auth.Data;
using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class LoginRiskService : ILoginRiskService
  {
    private readonly IUserService _userService;
    private readonly IEmailService _emailService;
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _config;

    // Successful geo lookups rarely change for a given IP within a short
    // window, so we cache them for a while. Failed/unknown lookups get a
    // much shorter TTL so we retry sooner without hammering the API on
    // every single login while it's down or rate-limited.
    private static readonly TimeSpan HitTtl = TimeSpan.FromHours(12);
    private static readonly TimeSpan MissTtl = TimeSpan.FromMinutes(5);

    public LoginRiskService(
      IUserService userService,
      IEmailService emailService,
      AppDbContext db,
      HttpClient httpClient,
      IMemoryCache cache,
      IConfiguration config
    )
    {
      _userService = userService;
      _emailService = emailService;
      _db = db;
      _httpClient = httpClient;
      _cache = cache;
      _config = config;
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

      if(user != null && user.LastKnownCountry != null && country != null && user.LastKnownCountry != country)
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
        RiskLevel = level,
        Timestamp = DateTime.UtcNow
      };

      _db.LoginRiskAssessments.Add(assessment);
      await _db.SaveChangesAsync();

      if(level == "High" && user != null)
      {
        await SendSuspiciousLoginEmailAsync(user, assessment);
      }

      return assessment;
    }

    public async Task SendSuspiciousLoginEmailAsync(AppUser user, LoginRiskAssessment assessment)
    {
      var subject = "Security Alert: Suspicious Login Detected";

      var body = $"""
      <p>Hi, {user.Email},</p>
      <br /><br />
      We have detected a suspicious login attempt on your account.</p>
      <br /><br />
      Details:
      <ul>
        <li>IP: {assessment.IpAddress}</li>
        <li>Country: {assessment.Country ?? "Unknown"}</li>
        <li>Device Fingerprint: {assessment.DeviceFingerprint ?? "Unknown"}</li>
        <li>Risk Level: {assessment.RiskLevel}</li>
      </ul>
      <br /><br />
      <p>If this was not you, please revoke all active sessions immediately:
      {_config["AppUrls:FrontendBaseUrl"]}/settings/sessions
      </p>
      """;

      await _emailService.SendAsync(user.Email!, subject, body);
    }

    public async Task<string?> GetCountryFromIpAsync(string ip)
    {
      if(string.IsNullOrWhiteSpace(ip) ||
      ip == "127.0.0.1" ||
      ip == "::1" ||
      ip.StartsWith("192.168.") ||
      ip.StartsWith("10.") ||
      ip.StartsWith("172.16.") ||
      ip.StartsWith("172.17.") ||
      ip.StartsWith("172.18.") ||
      ip.StartsWith("172.19.") ||
      ip.StartsWith("172.20.") ||
      ip.StartsWith("172.21.") ||
      ip.StartsWith("172.22.") ||
      ip.StartsWith("172.23.") ||
      ip.StartsWith("172.24.") ||
      ip.StartsWith("172.25.") ||
      ip.StartsWith("172.26.") ||
      ip.StartsWith("172.27.") ||
      ip.StartsWith("172.28.") ||
      ip.StartsWith("172.29.") ||
      ip.StartsWith("172.30.") ||
      ip.StartsWith("172.31."))
      {
        return null;
      }

      var cacheKey = $"geoip:{ip}";

      if(_cache.TryGetValue<string?>(cacheKey, out var cached))
      {
        return cached;
      }

      var result = await FetchCountryFromIpAsync(ip);

      _cache.Set(cacheKey, result, result != null ? HitTtl : MissTtl);

      return result;
    }

    private async Task<string?> FetchCountryFromIpAsync(string ip)
    {
      try
      {
        var token = _config["IpInfo:Token"];

        if (string.IsNullOrWhiteSpace(token))
        {
          return null;
        }

        var url = $"https://ipinfo.io/{ip}/country?token={token}";

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
          return null;
        }

        var content = (await response.Content.ReadAsStringAsync()).Trim();

        if (string.IsNullOrWhiteSpace(content))
        {
          return null;
        }

        var countryCode = content.ToUpperInvariant();
        var countryName = CountryCodeToName(countryCode);

        return countryName;
      }
      catch
      {
        // Timeouts, DNS failures, rate limiting, etc. all fall back to
        // "unknown country" rather than blocking or failing the login.
        return null;
      }
    }

    private static string? CountryCodeToName(string code)
    {
      return code switch
      {
        "SE" => "Sweden",
        "NO" => "Norway",
        "DK" => "Denmark",
        "FI" => "Finland",
        "US" => "United States",
        "GB" => "United Kingdom",
        "DE" => "Germany",
        "FR" => "France",
        "NL" => "Netherlands",
        "ES" => "Spain",
        "IT" => "Italy",
        "PL" => "Poland",
        "CA" => "Canada",
        "AU" => "Australia",
        _ => null
      };
    }
  }
}
