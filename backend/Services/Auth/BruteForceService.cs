using Microsoft.EntityFrameworkCore;

using Entry.Auth.Data;
using Entry.Auth.Models;

namespace Entry.Auth.Services
{
  public class BruteForceService : IBruteForceService
  {
    private readonly AppDbContext _db;

    private static readonly TimeSpan IpWindow = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan EmailWindow = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan UserWindow = TimeSpan.FromMinutes(5);

    private const int IpLimit = 20;
    private const int EmailLimit = 10;
    private const int UserLimit = 5;

    public BruteForceService(AppDbContext db)
    {
      _db = db;
    }

    public async Task LogAsync(
      string endpoint,
      string ip,
      string? email,
      string? userId,
      bool success
    )
    {
      var attempt = new AuthAttempt
      {
        Endpoint = endpoint,
        IpAddress = ip,
        Email = email,
        UserId = userId,
        Success = success,
        Timestamp = DateTime.UtcNow
      };

      _db.AuthAttempts.Add(attempt);
      await _db.SaveChangesAsync();
    }

    public async Task<bool> IsIpBlocked(string ip)
    {
      var cutoff = DateTime.UtcNow - IpWindow;

      var count = await _db.AuthAttempts
        .Where(x => x.IpAddress == ip && x.Timestamp >= cutoff)
        .CountAsync();

      return count >= IpLimit;
    }

    public async Task<bool> IsEmailBlocked(string email)
    {
      var cutoff = DateTime.UtcNow - EmailWindow;

      var count = await _db.AuthAttempts
        .Where(x => x.Email == email && x.Timestamp >= cutoff)
        .CountAsync();

      return count >= EmailLimit;
    }

    public async Task<bool> IsUserBlocked(string userId)
    {
      var cutoff = DateTime.UtcNow - UserWindow;

      var count = await _db.AuthAttempts
        .Where(x => x.UserId == userId && x.Timestamp >= cutoff)
        .CountAsync();

      return count >= UserLimit;
    }
  }
}