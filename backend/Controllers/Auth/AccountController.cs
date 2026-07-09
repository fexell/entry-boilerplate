using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Entry.Auth.Services;
using Entry.Auth.Extensions;
using Entry.Auth.DTOs;

namespace Entry.Auth.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class AccountController : ControllerBase
  {
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUserService _userService;
    private readonly IEmailChangeService _emailChangeService;

    public AccountController(IRefreshTokenService refreshTokenService, IUserService userService, IEmailChangeService emailChangeService)
    {
      _refreshTokenService = refreshTokenService;
      _userService = userService;
      _emailChangeService = emailChangeService;
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
      var userId = User.GetUserId();
      var currentRefreshToken = Request.Cookies["refreshToken"];

      var sessions = await _refreshTokenService.GetActiveSessionsAsync(userId, currentRefreshToken);

      return Ok(sessions);
    }

    [HttpDelete("sessions/{id}")]
    public async Task <IActionResult> RevokeSession(Guid id)
    {
      var userId = User.GetUserId();
      var revoked = await _refreshTokenService.RevokeSessionAsync(userId, id);

      if(!revoked) return NotFound();

      return NoContent();
    }

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto dto)
    {
      var userId = User.GetUserId();
      var user = await _userService.GetByIdAsync(userId);

      if(user == null) return NotFound();

      var success = await _userService.UpdateUserAsync(user, dto);

      if(!success) return BadRequest("Could not update profile.");

      var me = await _userService.GetUserMeAsync(user);

      return Ok(me);
    }

    [HttpPatch("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
      var userId = User.GetUserId();
      var user = await _userService.GetByIdAsync(userId);

      if(user == null) return NotFound();
      
      var result = await _userService.ChangePasswordAsync(user, dto);

      if (!result.Succeeded)
      {
        return BadRequest(new
        {
          errors = result.Errors.Select(e => e.Description).ToList()
        });
      }

      var currentRefreshToken = Request.Cookies["refreshToken"];
      await _refreshTokenService.RevokeAllSessionsExceptCurrentAsync(userId, currentRefreshToken);

      return NoContent();
    }

    [HttpPost("email/change-request")]
    public async Task<IActionResult> RequestEmailChange([FromBody] RequestEmailChangeDto dto)
    {
      var userId = User.GetUserId();
      var user = await _userService.GetByIdAsync(userId);
      if(user == null) return NotFound();

      var result = await _emailChangeService.RequestEmailChangeAsync(user, dto.NewEmail, dto.Password);

      return result switch
      {
        EmailChangeResult.Success => Ok(new { message = "A confirmation email has been sent to your new email address." }),
        EmailChangeResult.InvalidPassword => BadRequest(new { message = "Incorrect password." }),
        EmailChangeResult.EmailInUse => BadRequest(new { message = "That email address is already in use." }),
        EmailChangeResult.SameEmail => BadRequest(new { message = "You cannot change to the same email address." }),
        _ => BadRequest(new { message = "Could not process request." }),
      };
    }

    [AllowAnonymous]
    [HttpPost("email/change-confirm")]
    public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeDto dto)
    {
      var user = await _userService.GetByIdAsync(dto.UserId);
      if(user == null) return BadRequest(new { message = "Invalid or expired confirmation link." });

      var success = await _emailChangeService.ConfirmEmailChangeAsync(user, dto.NewEmail, dto.Token);
      if(!success) return BadRequest(new { message = "Invalid or expired confirmation link." });

      await _refreshTokenService.RevokeAllUserTokensAsync(user.Id);

      return Ok(new { message = "Email changed successfully. Please sign in with your new email address." });
    }
  }
}