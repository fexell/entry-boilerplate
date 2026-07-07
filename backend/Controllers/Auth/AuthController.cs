using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

    public AuthController(
      IAuthService authService,
      IUserService userService,
      IVerificationEmailService verificationEmailService,
      IPasswordResetService passwordResetService
    )
    {
      _authService = authService;
      _userService = userService;
      _verificationEmailService = verificationEmailService;
      _passwordResetService = passwordResetService;
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
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
      var result = await _authService.LoginAsync(dto);

      // ❗ 1. Om 2FA krävs → returnera direkt utan cookies
      if (result.RequiresTwoFactor)
      {
        return Ok(new
        {
          requiresTwoFactor = true,
          twoFactorToken = result.TwoFactorToken
        });
      }

      // ❗ 2. Om login misslyckas → returnera fel
      if (!result.Success)
      {
        return Unauthorized(new
        {
          message = "Invalid credentials.",
          errors = result.Errors
        });
      }

      // ❗ 3. Sätt cookies (nu vet vi att AccessToken & RefreshToken INTE är null)
      CookieHelper.Set(Response, "accessToken", result.AccessToken!, TimeSpan.FromHours(1));
      CookieHelper.Set(Response, "refreshToken", result.RefreshToken!, TimeSpan.FromDays(30));

      // ❗ 4. Returnera user-info
      return Ok(new
      {
        success = true,
        user = result.User
      });
    }

    [AllowAnonymous]
    [HttpPost("2fa/verify-login")]
    public async Task<IActionResult> VerifyTwoFactorLogin([FromBody] VerifyTwoFactorLoginDto dto)
    {
      var result = await _authService.VerifyTwoFactorLoginAsync(dto);

      if (!result.Success)
        return Unauthorized(new { message = "Verification failed.", errors = result.Errors });

      CookieHelper.Set(Response, "accessToken", result.AccessToken!, TimeSpan.FromHours(1));
      CookieHelper.Set(Response, "refreshToken", result.RefreshToken!, TimeSpan.FromDays(30));

      return Ok(new
      {
        success = result.Success,
        user = result.User
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
