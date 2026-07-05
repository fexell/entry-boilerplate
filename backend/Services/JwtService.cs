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

    public JwtTokenResult GenerateToken(AppUser user)
    {
      var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
      );

      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
      {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
        new Claim("username", user.UserName ?? "")
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

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string? ValidateTwoFactorToken(string token)
    {
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

        var purpose = principal.FindFirst("purpose")?.Value;
        if(purpose != TwoFactorPurpose) return null;

        return principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
      }
      catch
      {
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
