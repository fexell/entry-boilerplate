using Microsoft.EntityFrameworkCore;

using Entry.Auth.Data;
using Entry.Auth.Models;
using Entry.Auth.Utils;
using Entry.Auth.DTOs;

namespace Entry.Auth.Services
{
  public class RefreshTokenService : IRefreshTokenService
  {
    private readonly AppDbContext _db;
    private readonly IJwtService _jwtService;

    public RefreshTokenService(AppDbContext db, IJwtService jwtService)
    {
      _db = db;
      _jwtService = jwtService;
    }

    // ------------------------------------------------------
    // CREATE REFRESH TOKEN
    // ------------------------------------------------------
    // If sessionId is null, this is treated as a fresh login and a new
    // UserSession is created. If sessionId is provided (rotation), the
    // existing session is reused so its Id/CreatedAt/UserAgent survive
    // across token rotations, and only LastUsedAt is bumped.

    public async Task<string> CreateRefreshTokenAsync(
      string userId,
      Guid? sessionId = null,
      string? userAgent = null,
      string? ipAddress = null)
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
        ExpiresAt = DateTime.UtcNow.AddDays(30),
        Revoked = false
      };

      _db.RefreshTokens.Add(refresh);
      await _db.SaveChangesAsync();

      return token;
    }

    // ------------------------------------------------------
    // REFRESH TOKEN (ROTATION)
    // ------------------------------------------------------

    public async Task<TokenPair?> RefreshTokenAsync(string refreshToken)
    {
      var token = await _db.RefreshTokens
        .Include(x => x.Session)
        .FirstOrDefaultAsync(x => x.Token == refreshToken);

      if (token == null || token.Revoked || token.ExpiresAt < DateTime.UtcNow)
        return null;

      if (token.Session?.RevokedAt is not null)
        return null;

      var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == token.UserId);
      if (user == null)
        return null;

      // revoke old refresh token
      token.Revoked = true;
      await _db.SaveChangesAsync();

      // create new refresh token, keeping the same session alive
      var newRefresh = await CreateRefreshTokenAsync(user.Id, token.SessionId);

      // create new access token
      var jwt = _jwtService.GenerateToken(user);

      return new TokenPair
      {
        AccessToken = jwt.Token,
        RefreshToken = newRefresh,
        ExpiresInSeconds = jwt.ExpiresInSeconds
      };
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

      var session = await _db.UserSessions
        .FirstOrDefaultAsync(s => s.Id == token.SessionId);

      if (session is not null)
        session.RevokedAt = DateTime.UtcNow;

      await _db.SaveChangesAsync();
      return true;
    }

    public async Task<bool> RevokeAllUserTokensAsync(string userId)
    {
      var tokens = await _db.RefreshTokens
        .Where(x => x.UserId == userId && !x.Revoked)
        .ToListAsync();

      foreach (var t in tokens)
        t.Revoked = true;

      var sessions = await _db.UserSessions
        .Where(s => s.UserId == userId && s.RevokedAt == null)
        .ToListAsync();

      foreach (var s in sessions)
        s.RevokedAt = DateTime.UtcNow;

      await _db.SaveChangesAsync();
      return true;
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

      foreach(var session in sessions)
      {
        session.RevokedAt = DateTime.UtcNow;

        foreach(var t in session.RefreshTokens.Where(t => !t.Revoked))
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
