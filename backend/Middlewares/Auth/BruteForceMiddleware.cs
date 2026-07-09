using System.Collections.Concurrent;

namespace Entry.Auth.Middlewares
{
  public class BruteForceMiddleware
  {
    private readonly RequestDelegate _next;
    private static readonly ConcurrentDictionary<string, List<DateTime>> IpAttempts = new();
    private static readonly ConcurrentDictionary<string, List<DateTime>> EmailAttempts = new();
    private static readonly ConcurrentDictionary<string, DateTime> BlockedIps = new();

    private const int IpLimit = 20;
    private static readonly TimeSpan IpWindow = TimeSpan.FromMinutes(5);

    private const int EmailLimit = 10;
    private static readonly TimeSpan EmailWindow = TimeSpan.FromMinutes(10);

    private static readonly TimeSpan BlockDuration = TimeSpan.FromMinutes(10);

    public BruteForceMiddleware(RequestDelegate next)
    {
      _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
      var path = context.Request.Path.Value?.ToLower();

      if(path is not null && path.StartsWith("/auth"))
      {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if(BlockedIps.TryGetValue(ip, out var blockedUntil))
        {
          if(blockedUntil > DateTime.UtcNow)
          {
            context.Response.StatusCode = 429;
            await context.Response.WriteAsync("Too many requests. Please try again later.");
            return;
          }
          else
          {
            BlockedIps.TryRemove(ip, out _);
          }
        }

        LogAttempt(IpAttempts, ip);

        if(IsLimitExceeded(IpAttempts, ip, IpLimit, IpWindow))
        {
          BlockedIps[ip] = DateTime.UtcNow.Add(BlockDuration);
          context.Response.StatusCode = 429;
          await context.Response.WriteAsync("Too many requests from this IP. Please try again later.");
        }

        if(context.Request.Method == "POST" && context.Request.ContentType?.Contains("application/json") == true)
        {
          context.Request.EnableBuffering();

          using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
          var body = await reader.ReadToEndAsync();
          context.Request.Body.Position = 0;

          var email = ExtractEmail(body);
          if(email is not null)
          {
            LogAttempt(EmailAttempts, email);

            if(IsLimitExceeded(EmailAttempts, email, EmailLimit, EmailWindow))
            {
              context.Response.StatusCode = 429;
              await context.Response.WriteAsync("Too many attempts for this account. Please try again later.");
            }
          }
        }
      }

      await _next(context);
    }

    private static void LogAttempt(ConcurrentDictionary<string, List<DateTime>> dict, string key)
    {
      var now = DateTime.UtcNow;

      dict.AddOrUpdate(key,
        _ => new List<DateTime> { now },
        (_, list) =>
        {
          list.Add(now);
          return list;
        });
    }

    private static bool IsLimitExceeded(
      ConcurrentDictionary<string, List<DateTime>> dict,
      string key,
      int limit,
      TimeSpan window
    )
    {
      if(!dict.TryGetValue(key, out var list))
      {
        return false;
      }

      var cutoff = DateTime.UtcNow - window;

      list.RemoveAll(t => t < cutoff);

      return list.Count >= limit;
    }

    private static string? ExtractEmail(string json)
    {
      try
      {
        using var doc = System.Text.Json.JsonDocument.Parse(json);
        if(doc.RootElement.TryGetProperty("email", out var emailProp))
        {
          return emailProp.GetString();
        }
      }
      catch {}

      return null;
    }
  }
}