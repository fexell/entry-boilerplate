using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.RateLimiting;

using Entry.Auth.DTOs;
using Entry.Auth.Models;
using Entry.Auth.Services;
using Entry.Auth.Utils;
using System.Security.Claims;

namespace Entry.Auth.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly IVerificationEmailService _verificationEmailService;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IBruteForceService _bruteForceService;
    private readonly ITwoFactorService _twoFactorService;
    private readonly IAntiforgery _antiforgery;

    public AuthController(
      IAuthService authService,
      IUserService userService,
      IVerificationEmailService verificationEmailService,
      IPasswordResetService passwordResetService,
      IBruteForceService bruteForceService,
      ITwoFactorService twoFactorService,
      IAntiforgery antiforgery
    )
    {
      _authService = authService;
      _userService = userService;
      _verificationEmailService = verificationEmailService;
      _passwordResetService = passwordResetService;
      _bruteForceService = bruteForceService;
      _twoFactorService = twoFactorService;
      _antiforgery = antiforgery;
    }

    // ------------------------------------------------------
    // CSRF TOKEN
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpGet("csrf-token")]
    public IActionResult GetCsrfToken()
    {
      var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

      return Ok(new { csrfToken = tokens.RequestToken });
    }

    // ------------------------------------------------------
    // REGISTER (NO LOGIN)
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
      var result = await _authService.RegisterAsync(dto);

      if (!result.Success) return BadRequest(new { message = "Registration failed.", errors = result.Errors });

      return Ok(new { message = "User created. Please verify your email." });
    }

    // ------------------------------------------------------
    // VERIFY EMAIL
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
      var user = await _userService.GetByIdAsync(dto.UserId!);
      if (user == null)
        return NotFound(new { message = "User not found." });

      var success = await _authService.VerifyEmailAsync(user, dto.Token!);

      if (!success)
        return Conflict(new { message = "Email verification failed." });

      return Ok(new { message = "Email verified successfully." });
    }

    // ------------------------------------------------------
    // RESEND VERIFICATION
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
      var user = await _userService.GetByEmailAsync(dto.Email!);

      if(user is not null)
        await _verificationEmailService.TryResendVerificationEmailAsync(user);

      return Ok(new { message = "If an account with that email exists and isn't verified yet, a new verification email has been sent." });
    }

    // ------------------------------------------------------
    // LOGIN
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
      var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

      // -----------------------------
      // 1. BRUTE-FORCE CHECKS
      // -----------------------------

      if(await _bruteForceService.IsIpBlocked(ip))
      {
        return StatusCode(429, new { message = "Too many requests from this IP. Please try again later." });
      }

      if(!string.IsNullOrWhiteSpace(dto.Email) && await _bruteForceService.IsEmailBlocked(dto.Email))
      {
        return StatusCode(429, new { message = "Too many requests from this email. Please try again later." });
      }

      var user = await _userService.GetByEmailAsync(dto.Email!);
      if(user != null && await _bruteForceService.IsUserBlocked(user.Id))
      {
        return StatusCode(429, new { message = "Too many requests from this user. Please try again later." });
      }

      // -----------------------------
      // 2. RUN LOGIN LOGIC
      // -----------------------------
      var result = await _authService.LoginAsync(dto);

      await _bruteForceService.LogAsync(
        endpoint: "login",
        ip: ip,
        email: dto.Email,
        userId: user?.Id,
        success: result.Success
      );

      // -----------------------------
      // 3. 2FA REQUIRED -> RETURN
      // -----------------------------
      if (result.RequiresTwoFactor)
      {
        return Ok(new
        {
          requiresTwoFactor = true,
          twoFactorToken = result.TwoFactorToken
        });
      }

      // -----------------------------
      // 5. FAILED LOGIN
      // -----------------------------
      if (!result.Success)
      {
        return Unauthorized(new
        {
          message = "Invalid credentials.",
          errors = result.Errors
        });
      }

      // -----------------------------
      // 6. SET COOKIES
      // -----------------------------
      CookieHelper.Set(Response, "accessToken", result.AccessToken!, TimeSpan.FromHours(1));
      CookieHelper.Set(Response, "refreshToken", result.RefreshToken!, TimeSpan.FromDays(30));

      // -----------------------------
      // 7. RETURN USER AND MESSAGE
      // -----------------------------
      return Ok(new
      {
        success = true,
        user = result.User,
        message = "Login successful."
      });
    }

    [AllowAnonymous]
    [HttpPost("2fa/verify-login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> VerifyTwoFactorLogin([FromBody] VerifyTwoFactorLoginDto dto)
    {
      var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

      // -----------------------------
      // 1. BRUTE-FORCE CHECKS
      // -----------------------------

      var userId = _twoFactorService.GetUserIdFromTwoFactorToken(dto.TwoFactorToken!);

      if(userId == null)
        return Unauthorized(new { message = "Invalid or expired 2FA token." });

      if(await _bruteForceService.IsIpBlocked(ip))
        return StatusCode(429, new { message = "Too many requests from this IP. Please try again later." });

      if(await _bruteForceService.IsUserBlocked(userId))
        return StatusCode(429, new { message = "Too many 2FA attempts from this user. Please try again later." });

      // -----------------------------
      // 2. RUN 2FA-VERIFICATION
      // -----------------------------
      var result = await _authService.VerifyTwoFactorLoginAsync(dto);

      // -----------------------------
      // 3. LOG BRUTE FORCE ATTEMPTS
      // -----------------------------

      await _bruteForceService.LogAsync(
        endpoint: "2fa/verify-login",
        ip: ip,
        email: null,
        userId: userId,
        success: result.Success
      );

      // -----------------------------
      // 4. FAILED 2FA
      // -----------------------------

      if (!result.Success)
        return Unauthorized(new { message = "Verification failed.", errors = result.Errors });

      // -----------------------------
      // 5. SET COOKIES
      // -----------------------------

      CookieHelper.Set(Response, "accessToken", result.AccessToken!, TimeSpan.FromHours(1));
      CookieHelper.Set(Response, "refreshToken", result.RefreshToken!, TimeSpan.FromDays(30));

      // -----------------------------
      // 6. RETURN USER AND MESSAGE
      // -----------------------------

      return Ok(new
      {
        success = result.Success,
        user = result.User,
        message = "Login successful."
      });
    }

    // ------------------------------------------------------
    // REFRESH TOKEN
    // ------------------------------------------------------
 
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
      var refreshToken = Request.Cookies["refreshToken"];

      if(string.IsNullOrEmpty(refreshToken))
        return Unauthorized(new { message = "No refresh token provided.", errors = new[] { "Missing refresh token." } });

      var result = await _authService.RefreshAsync(refreshToken);

      if (!result.Success)
        return BadRequest(new { message = "Invalid refresh token.", errors = result.Errors });

      CookieHelper.Set(Response, "accessToken", result.AccessToken!, TimeSpan.FromHours(1));
      CookieHelper.Set(Response, "refreshToken", result.RefreshToken!, TimeSpan.FromDays(30));

      return Ok(new { user = result.User });
    }

    // ------------------------------------------------------
    // FORGOT PASSWORD
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
      var user = await _userService.GetByEmailAsync(dto.Email!);

      if(user is not null && user.EmailConfirmed) await _passwordResetService.SendPasswordResetEmailAsync(user);

      return Ok(new { message = "If an account with that email exists and is verified, a password reset email has been sent." });
    }

    // ------------------------------------------------------
    // RESET PASSWORD
    // ------------------------------------------------------

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
      var user = await _userService.GetByIdAsync(dto.UserId!);

      if(user == null) return BadRequest(new { message = "Invalid or expired reset link." });

      var success = await _passwordResetService.ResetPasswordAsync(user, dto.Token!, dto.NewPassword!);

      if(!success) return BadRequest(new { message = "Invalid or expired reset link." });

      await _authService.RevokeAllUserTokensAsync(user.Id);

      return Ok(new { message = "Password reset successfully." });
    }

    // ------------------------------------------------------
    // LOGOUT
    // ------------------------------------------------------

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
      var refreshToken = Request.Cookies["refreshToken"];
      if (!string.IsNullOrEmpty(refreshToken))
      {
        await _authService.RevokeRefreshTokenAsync(refreshToken);
      }

      CookieHelper.Delete(Response, "accessToken");
      CookieHelper.Delete(Response, "refreshToken");

      return Ok(new { message = "Logged out." });
    }
  }
}
