using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class JwtService : IJwtService
  {
    private readonly IConfiguration _config;
    private const string TwoFactorPurpose = "2fa";

    public JwtService(IConfiguration config)
    {
      _config = config;
    }

    public JwtTokenResult GenerateToken(AppUser user, Guid sessionId)
    {
      var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
      );

      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
        new Claim("username", user.UserName ?? ""),
        new Claim("sid", sessionId.ToString())
      };

      var expires = DateTime.UtcNow.AddHours(1);

      var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: expires,
        signingCredentials: creds
      );

      var jwt = new JwtSecurityTokenHandler().WriteToken(token);

      return new JwtTokenResult
      {
        Token = jwt,
        ExpiresAt = expires,
        ExpiresInSeconds = (int)(expires - DateTime.UtcNow).TotalSeconds
      };
    }

    public string GenerateTwoFactorToken(AppUser user)
    {
      var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
      );

      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim("purpose", TwoFactorPurpose)
      };

      var expires = DateTime.UtcNow.AddMinutes(5);

      var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: expires,
        signingCredentials: creds
      );

      Console.WriteLine("GENERATING 2FA TOKEN WITH SUB: ", user.Id);

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string? ValidateTwoFactorToken(string token)
    {
      Console.WriteLine("VALIDATING TOKEN: ", token);

      var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
      );

      var validationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = _config["Jwt:Issuer"],
        ValidAudience = _config["Jwt:Audience"],
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.Zero
      };

      try
      {
        var principal = new JwtSecurityTokenHandler().ValidateToken(
          token,
          validationParameters,
          out var validatedToken
        );

        Console.WriteLine("2FA PRINCIPAL CLAIMS:");
        foreach (var c in principal.Claims)
          Console.WriteLine($"{c.Type} = {c.Value}");

        var purpose = principal.FindFirst("purpose")?.Value;
        if (purpose != TwoFactorPurpose)
        {
          Console.WriteLine($"Invalid 2FA purpose: {purpose}");
          return null;
        }

        var sub = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"2FA SUB: {sub}");
        return sub;
      }
      catch (Exception ex)
      {
        Console.WriteLine("2FA TOKEN VALIDATION ERROR: " + ex.Message);
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
