using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class JwtService : IJwtService
  {
    private readonly IConfiguration _config;
    private readonly ILogger<JwtService> _logger;

    private const string TwoFactorPurpose = "2fa";
    private static readonly TimeSpan TwoFactorTokenLifetime = TimeSpan.FromMinutes(5);

    public JwtService(IConfiguration config, ILogger<JwtService> logger)
    {
      _config = config;
      _logger = logger;
    }

    private SigningCredentials GetSigningCredentials()
    {
      var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
      );

      return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public JwtTokenResult GenerateToken(AppUser user, Guid sessionId)
    {
      var accessTokenMinutes = _config.GetValue<int?>("Jwt:AccessTokenMinutes") ?? 60;
      var lifetime = TimeSpan.FromMinutes(accessTokenMinutes);

      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
        new Claim("username", user.UserName ?? ""),
        new Claim("sid", sessionId.ToString())
      };

      var expires = DateTime.UtcNow.Add(lifetime);

      var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: expires,
        signingCredentials: GetSigningCredentials()
      );

      var jwt = new JwtSecurityTokenHandler().WriteToken(token);

      return new JwtTokenResult
      {
        Token = jwt,
        ExpiresAt = expires,
        ExpiresInSeconds = (int)lifetime.TotalSeconds
      };
    }

    public string GenerateTwoFactorToken(AppUser user)
    {
      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim("purpose", TwoFactorPurpose)
      };

      var expires = DateTime.UtcNow.Add(TwoFactorTokenLifetime);

      var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: expires,
        signingCredentials: GetSigningCredentials()
      );

      _logger.LogDebug("Generated 2FA token for UserId: {UserId}", user.Id);

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string? ValidateTwoFactorToken(string token)
    {
      var validationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = _config["Jwt:Issuer"],
        ValidAudience = _config["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
          Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        ),
        ClockSkew = TimeSpan.Zero
      };

      try
      {
        var principal = new JwtSecurityTokenHandler().ValidateToken(
          token,
          validationParameters,
          out _
        );

        var purpose = principal.FindFirst("purpose")?.Value;
        if (purpose != TwoFactorPurpose)
        {
          _logger.LogWarning("2FA token validation failed: unexpected purpose '{Purpose}'.", purpose);
          return null;
        }

        var sub = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (sub is null)
        {
          _logger.LogWarning("2FA token validation failed: missing sub claim.");
        }

        return sub;
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "2FA token validation failed.");
        return null;
      }
    }
  }

  public class JwtTokenResult
  {
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int ExpiresInSeconds { get; set; }
  }
}
