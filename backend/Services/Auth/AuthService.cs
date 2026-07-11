using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Entry.Auth.Data;
using Entry.Auth.Models;
using Entry.Auth.DTOs;

namespace Entry.Auth.Services
{
  public class AuthService : IAuthService
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IJwtService _jwtService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUserService _userService;
    private readonly IVerificationEmailService _verificationEmailService;
    private readonly ITwoFactorService _twoFactorService;
    private readonly AppDbContext _db;

    public AuthService(
      UserManager<AppUser> userManager,
      SignInManager<AppUser> signInManager,
      IJwtService jwtService,
      IRefreshTokenService refreshTokenService,
      IUserService userService,
      IVerificationEmailService verificationEmailService,
      ITwoFactorService twoFactorService,
      AppDbContext db
    )
    {
      _userManager = userManager;
      _signInManager = signInManager;
      _jwtService = jwtService;
      _refreshTokenService = refreshTokenService;
      _userService = userService;
      _verificationEmailService = verificationEmailService;
      _twoFactorService = twoFactorService;
      _db = db;
    }

    // ------------------------------------------------------
    // REGISTER
    // ------------------------------------------------------

    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
      var user = new AppUser
      {
        Email = dto.Email,
        UserName = dto.Username,
        CreatedAt = DateTime.UtcNow
      };

      var createResult = await _userManager.CreateAsync(user, dto.Password!);

      if (!createResult.Succeeded)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = createResult.Errors.Select(e => e.Description).ToList()
        };
      }

      await _verificationEmailService.SendVerificationEmailAsync(user);

      return new AuthResultDto { Success = true };
    }

    // ------------------------------------------------------
    // LOGIN
    // ------------------------------------------------------

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
      var user = await _userManager.Users
        .FirstOrDefaultAsync(u => u.Email == dto.Email);

      if (user == null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Invalid credentials." }
        };
      }

      var signInResult = await _signInManager.CheckPasswordSignInAsync(user, dto.Password!, lockoutOnFailure: true);

      if (signInResult.IsLockedOut)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Account is locked. Please try again later." }
        };
      }

      if (signInResult.IsNotAllowed)
      {
        if (!user.EmailConfirmed)
        {
          return new AuthResultDto
          {
            Success = false,
            Errors = new List<string> { "Please verify your email before logging in." }
          };
        }

        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Login not allowed." }
        };
      }

      if (!signInResult.Succeeded)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Invalid credentials." }
        };
      }

      if(await _userManager.GetTwoFactorEnabledAsync(user))
      {
        var twoFactorToken = _jwtService.GenerateTwoFactorToken(user);

        return new AuthResultDto
        {
          Success = true,
          RequiresTwoFactor = true,
          TwoFactorToken = twoFactorToken
        };
      }

      return await GenerateAuthResultAsync(user);
    }

    // ------------------------------------------------------
    // REFRESH
    // ------------------------------------------------------

    public async Task<AuthResultDto> RefreshAsync(string refreshToken)
    {
      var existing = await _db.RefreshTokens
        .FirstOrDefaultAsync(x => x.Token == refreshToken);

      if (existing == null || existing.Revoked || existing.ExpiresAt < DateTime.UtcNow)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Invalid or expired refresh token." }
        };
      }

      var user = await _userManager.FindByIdAsync(existing.UserId);
      if (user == null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "User not found." }
        };
      }

      var pair = await _refreshTokenService.RefreshTokenAsync(refreshToken);
      if (pair == null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Failed to refresh token." }
        };
      }

      var userMe = await _userService.GetUserMeAsync(user);

      return new AuthResultDto
      {
        Success = true,
        AccessToken = pair.AccessToken,
        RefreshToken = pair.RefreshToken,
        ExpiresIn = pair.ExpiresInSeconds,
        User = userMe
      };
    }

    // ------------------------------------------------------
    // SILENT REFRESH
    // ------------------------------------------------------

    public async Task<AuthResultDto> SilentRefreshAsync(AppUser user, string refreshToken)
    {
      var existing = await _db.RefreshTokens
        .FirstOrDefaultAsync(x => x.Token == refreshToken);

      if (existing == null || existing.Revoked || existing.ExpiresAt < DateTime.UtcNow || existing.UserId != user.Id)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Invalid or expired refresh token." }
        };
      }

      var pair = await _refreshTokenService.RefreshTokenAsync(refreshToken);
      if (pair == null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Failed to refresh token." }
        };
      }

      var userMe = await _userService.GetUserMeAsync(user);

      return new AuthResultDto
      {
        Success = true,
        AccessToken = pair.AccessToken,
        RefreshToken = pair.RefreshToken,
        ExpiresIn = pair.ExpiresInSeconds,
        User = userMe
      };
    }

    // ------------------------------------------------------
    // REVOKE
    // ------------------------------------------------------

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
      return await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);
    }

    public async Task<bool> RevokeAllUserTokensAsync(string userId)
    {
      return await _refreshTokenService.RevokeAllUserTokensAsync(userId);
    }

    // ------------------------------------------------------
    // EMAIL VERIFICATION
    // ------------------------------------------------------

    public async Task<bool> SendVerificationEmailAsync(AppUser user)
    {
      return await _verificationEmailService.SendVerificationEmailAsync(user);
    }

    public async Task<bool> VerifyEmailAsync(AppUser user, string token)
    {
      return await _userService.VerifyEmailAsync(user, token);
    }

    // ------------------------------------------------------
    // GENERATE AUTH RESULT
    // ------------------------------------------------------

    private async Task<AuthResultDto> GenerateAuthResultAsync(AppUser user)
    {
      var created = await _refreshTokenService.CreateRefreshTokenAsync(user.Id);
      var jwt = _jwtService.GenerateToken(user, created.SessionId);
      var userMe = await _userService.GetUserMeAsync(user);

      return new AuthResultDto
      {
        Success = true,
        AccessToken = jwt.Token,
        RefreshToken = created.Token,
        ExpiresIn = jwt.ExpiresInSeconds,
        User = userMe
      };
    }

    public async Task<AuthResultDto> VerifyTwoFactorLoginAsync(VerifyTwoFactorLoginDto dto)
    {
      var userId = _jwtService.ValidateTwoFactorToken(dto.TwoFactorToken);

      if(userId is null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Your session has expired." }
        };
      }

      var user = await _userManager.FindByIdAsync(userId);

      if(user == null)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Your session has expired. Please log in again." }
        };
      }

      var verified = dto.IsRecoveryCode
        ? await _twoFactorService.VerifyRecoveryCodeAsync(user, dto.Code)
        : await _twoFactorService.VerifyCodeAsync(user, dto.Code);

      if (!verified)
      {
        return new AuthResultDto
        {
          Success = false,
          Errors = new List<string> { "Invalid verification code." }
        };
      }

      return await GenerateAuthResultAsync(user);
    }
  }
}
