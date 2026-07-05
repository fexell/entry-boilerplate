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

    public AccountController(IRefreshTokenService refreshTokenService, IUserService userService)
    {
      _refreshTokenService = refreshTokenService;
      _userService = userService;
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
  }
}