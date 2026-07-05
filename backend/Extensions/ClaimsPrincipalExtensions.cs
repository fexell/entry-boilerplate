using System.Security.Claims;

namespace Entry.Auth.Extensions
{
  public static class ClaimsPrincipalExtensions
  {
    public static string GetUserId(this ClaimsPrincipal user)
    {
      return user.FindFirstValue(ClaimTypes.NameIdentifier)
          ?? user.FindFirstValue("sub")
          ?? user.FindFirstValue("uid")
          ?? throw new Exception("User ID claim missing.");
    }
  }
}