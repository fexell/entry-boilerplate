using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using Entry.Auth.Models;
using Entry.Auth.Services;
using Microsoft.AspNetCore.Authorization;

namespace Entry.Auth.Controllers
{
  [ApiController]
  [Route("api/2fa")]
  [Authorize]
  public class TwoFactorController : ControllerBase
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly ITwoFactorService _twoFactorService;

    public TwoFactorController(UserManager<AppUser> userManager, ITwoFactorService twoFactorService)
    {
      _userManager = userManager;
      _twoFactorService = twoFactorService;
    }

    [HttpGet("setup")]
    public async Task<IActionResult> GetSetup()
    {
      var user = await _userManager.GetUserAsync(User);

      if(user is null) return Unauthorized();

      var result = await _twoFactorService.GetSetupInfoAsync(user);

      return Ok(result);
    }

    [HttpPost("enable")]
    public async Task<IActionResult> Enable([FromBody] VerifyTwoFactorSetupRequest request)
    {
      var user = await _userManager.GetUserAsync(User);

      if(user is null) return Unauthorized();

      var success = await _twoFactorService.VerifyAndEnableAsync(user, request.Code);

      if(!success) return BadRequest(new { error = "Invalid verification code" });

      var recoveryCodes = await _twoFactorService.GenerateRecoveryCodesAsync(user);

      return Ok(new { recoveryCodes });
    }
  }

  public record VerifyTwoFactorSetupRequest(string Code);
}