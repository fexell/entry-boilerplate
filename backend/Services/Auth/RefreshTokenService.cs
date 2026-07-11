using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

using Entry.Auth.Data;
using Entry.Auth.Models;
using Entry.Auth.Utils;
using Entry.Auth.DTOs;

namespace Entry.Auth.Services
{
  public record CreatedRefreshToken(string Token, Guid SessionId);

  public class RefreshTokenService : IRefreshTokenService
  {
    private readonly AppDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly UserManager<AppUser> _userManager;
    private readonly ILogger<RefreshTokenService> _logger;

    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(30);

    public RefreshTokenService(
      AppDbContext db,
      IJwtService jwtService,
      UserManager<AppUser> userManager,
      ILogger<RefreshTokenService> logger
    )
    {
      _db = db;
      _jwtService = jwtService;
      _userManager = userManager;
      _logger = logger;
    }

    // ------------------------------------------------------
    // CREATE REFRESH TOKEN
    // ------------------------------------------------------
    // If sessionId is null, this is treated as a fresh login and a new
    // UserSession is created. If sessionId is provided (rotation), the
    // existing session is reused so its Id/CreatedAt/UserAgent survive
    // across token rotations, and only LastUsedAt is bumped.

    public async Task<CreatedRefreshToken> CreateRefreshTokenAsync(
      string userId,
      Guid? sessionId = null,
      string? userAgent = null,
      string? ipAddress = null
    )
    {
      UserSession? session = sessionId is not null
        ? await _db.UserSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId)
        : null;

      if (session == null)
      {
        session = new UserSession
        {
          Id = Guid.NewGuid(),
          UserId = userId,
          UserAgent = userAgent,
          IpAddress = ipAddress,
          CreatedAt = DateTime.UtcNow,
          LastUsedAt = DateTime.UtcNow
        };
        _db.UserSessions.Add(session);
      }
      else
      {
        session.LastUsedAt = DateTime.UtcNow;
      }

      var token = TokenGenerator.GenerateRandomToken(32);

      var refresh = new RefreshToken
      {
        Token = token,
        UserId = userId,
        SessionId = session.Id,
        ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime),
        CreatedAt = DateTime.UtcNow,
        Revoked = false
      };

      _db.RefreshTokens.Add(refresh);
      await _db.SaveChangesAsync();

      return new CreatedRefreshToken(token, session.Id);
    }

    // NOTE: the previous single-argument overload `CreateRefreshTokenAsync(string userId)`
    // has been removed. It silently created a RefreshToken pointing at a brand-new
    // SessionId with no matching UserSession row — every plain login went through this
    // path (due to C# overload resolution preferring the exact-arity match) and produced
    // an orphaned session reference. Calls with just `userId` now resolve to the
    // session-aware overload above via its default parameters.

    // ------------------------------------------------------
    // REFRESH TOKEN (SILENT REFRESH)
    // ------------------------------------------------------

    public async Task<TokenPair?> RefreshTokenAsync(string refreshToken)
    {
      await using var transaction = await _db.Database.BeginTransactionAsync();

      try
      {
        var token = await _db.RefreshTokens
          .Include(x => x.Session)
          .FirstOrDefaultAsync(x => x.Token == refreshToken);

        if (token == null || token.Revoked || token.ExpiresAt < DateTime.UtcNow)
        {
          await transaction.RollbackAsync();
          return null;
        }

        if (token.Session?.RevokedAt is not null)
        {
          await transaction.RollbackAsync();
          return null;
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == token.UserId);
        if (user == null)
        {
          await transaction.RollbackAsync();
          return null;
        }

        token.Revoked = true;

        var newRefresh = await CreateRefreshTokenAsync(user.Id, token.SessionId);
        var jwt = _jwtService.GenerateToken(user, newRefresh.SessionId);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return new TokenPair
        {
          AccessToken = jwt.Token,
          RefreshToken = newRefresh.Token,
          ExpiresInSeconds = jwt.ExpiresInSeconds
        };
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error during silent refresh.");
        await transaction.RollbackAsync();
        return null;
      }
    }

    // ------------------------------------------------------
    // ROTATE REFRESH TOKEN (COOKIE-BASED REFRESH)
    // ------------------------------------------------------

    public async Task<TokenRotationResultDto?> RotateRefreshTokenAsync(string refreshToken, string? expectedUserId)
    {
      await using var transaction = await _db.Database.BeginTransactionAsync();

      try
      {
        var existing = await _db.RefreshTokens
          .FromSqlInterpolated($@"
            SELECT * FROM RefreshTokens WITH (UPDLOCK, ROWLOCK)
            WHERE Token = {refreshToken}")
          .Include(x => x.Session)
          .FirstOrDefaultAsync();

        if (existing == null)
        {
          _logger.LogWarning("Refresh token not found: {TokenPrefix}", refreshToken[..Math.Min(8, refreshToken.Length)]);

          await transaction.RollbackAsync();
          return null;
        }

        if (existing.Revoked)
        {
          _logger.LogWarning("Attempted reuse of revoked refresh token. UserId: {UserId}", existing.UserId);

          await RevokeAllUserTokensAsync(existing.UserId);
          await transaction.CommitAsync();
          return null;
        }

        if (existing.ExpiresAt < DateTime.UtcNow)
        {
          _logger.LogWarning("Expired refresh token used. UserId: {UserId}", existing.UserId);

          await transaction.RollbackAsync();
          return null;
        }

        if (expectedUserId != null && existing.UserId != expectedUserId)
        {
          _logger.LogWarning("Refresh token user mismatch. Expected: {Expected}, Actual: {Actual}", expectedUserId, existing.UserId);

          await transaction.RollbackAsync();
          return null;
        }

        existing.Revoked = true;

        var session = existing.Session
          ?? await _db.UserSessions.FirstOrDefaultAsync(s => s.Id == existing.SessionId);

        if (session != null)
        {
          session.LastUsedAt = DateTime.UtcNow;
        }

        var newRefreshTokenValue = GenerateSecureToken();
        var newRefreshToken = new RefreshToken
        {
          Token = newRefreshTokenValue,
          UserId = existing.UserId,
          SessionId = existing.SessionId,
          ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime),
          CreatedAt = DateTime.UtcNow,
        };

        _db.RefreshTokens.Add(newRefreshToken);

        var user = await _userManager.FindByIdAsync(existing.UserId);
        if (user == null)
        {
          _logger.LogError("User not found during token rotation. UserId: {UserId}", existing.UserId);

          await transaction.RollbackAsync();
          return null;
        }

        var jwt = _jwtService.GenerateToken(user, newRefreshToken.SessionId);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return new TokenRotationResultDto
        {
          AccessToken = jwt.Token,
          RefreshToken = newRefreshTokenValue,
          ExpiresInSeconds = jwt.ExpiresInSeconds,
          UserId = existing.UserId
        };
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error during refresh token rotation.");

        await transaction.RollbackAsync();
        return null;
      }
    }

    // ------------------------------------------------------
    // REVOKE
    // ------------------------------------------------------

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
      var token = await _db.RefreshTokens
        .FirstOrDefaultAsync(x => x.Token == refreshToken);

      if (token == null) return false;

      token.Revoked = true;
      await _db.SaveChangesAsync();

      return true;
    }

    public async Task<bool> RevokeAllUserTokensAsync(string userId)
    {
      var tokens = await _db.RefreshTokens
        .Where(x => x.UserId == userId && !x.Revoked)
        .ToListAsync();

      foreach (var token in tokens)
      {
        token.Revoked = true;
      }

      await _db.SaveChangesAsync();

      return true;
    }

    private static string GenerateSecureToken()
    {
      return TokenGenerator.GenerateRandomToken(32);
    }

    // ------------------------------------------------------
    // SESSIONS
    // ------------------------------------------------------

    public async Task<IEnumerable<SessionDto>> GetActiveSessionsAsync(string userId, string? currentRefreshToken)
    {
      var sessions = await _db.UserSessions
        .Include(s => s.RefreshTokens)
        .Where(s => s.UserId == userId && s.RevokedAt == null)
        .Where(s => s.RefreshTokens.Any(t => !t.Revoked && t.ExpiresAt > DateTime.UtcNow))
        .OrderByDescending(s => s.LastUsedAt)
        .ToListAsync();

      return sessions.Select(s => new SessionDto(
        s.Id,
        DescribeDevice(s.UserAgent),
        s.LastUsedAt,
        currentRefreshToken != null &&
          s.RefreshTokens.Any(t => t.Token == currentRefreshToken && !t.Revoked)
      ));
    }

    public async Task<bool> RevokeSessionAsync(string userId, Guid sessionId)
    {
      var session = await _db.UserSessions
        .Include(s => s.RefreshTokens)
        .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

      if (session == null) return false;

      session.RevokedAt = DateTime.UtcNow;

      foreach (var t in session.RefreshTokens.Where(t => !t.Revoked))
        t.Revoked = true;

      await _db.SaveChangesAsync();
      return true;
    }

    public async Task RevokeAllSessionsExceptCurrentAsync(string userId, string? currentRefreshToken)
    {
      Guid? currentSessionId = null;

      if (!string.IsNullOrEmpty(currentRefreshToken))
      {
        var currentToken = await _db.RefreshTokens
          .FirstOrDefaultAsync(t => t.Token == currentRefreshToken && t.UserId == userId);

        currentSessionId = currentToken?.SessionId;
      }

      var sessions = await _db.UserSessions
        .Include(s => s.RefreshTokens)
        .Where(s => s.UserId == userId && s.RevokedAt == null)
        .Where(s => currentSessionId == null || s.Id != currentSessionId)
        .ToListAsync();

      foreach (var session in sessions)
      {
        session.RevokedAt = DateTime.UtcNow;

        foreach (var t in session.RefreshTokens.Where(t => !t.Revoked))
          t.Revoked = true;
      }

      await _db.SaveChangesAsync();
    }

    private static string DescribeDevice(string? userAgent)
    {
      if (string.IsNullOrWhiteSpace(userAgent)) return "Unknown device";

      if (userAgent.Contains("iPhone")) return "iPhone · Safari";
      if (userAgent.Contains("Macintosh")) return "Mac · " + BrowserFrom(userAgent);
      if (userAgent.Contains("Windows")) return "Windows · " + BrowserFrom(userAgent);
      if (userAgent.Contains("Android")) return "Android · " + BrowserFrom(userAgent);

      return "Unknown device";
    }

    private static string BrowserFrom(string ua) =>
      ua.Contains("Edg") ? "Edge" :
      ua.Contains("Chrome") ? "Chrome" :
      ua.Contains("Firefox") ? "Firefox" :
      ua.Contains("Safari") ? "Safari" : "Browser";
  }
}
