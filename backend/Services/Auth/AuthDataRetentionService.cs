using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using Entry.Auth.Data;

namespace Entry.Auth.Services
{
  public class AuthDataRetentionService : BackgroundService
  {
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuthDataRetentionService> _logger;
    private readonly IConfiguration _config;

    private static readonly TimeSpan RunInterval = TimeSpan.FromHours(24);

    public AuthDataRetentionService(
      IServiceScopeFactory scopeFactory,
      ILogger<AuthDataRetentionService> logger,
      IConfiguration config
    )
    {
      _scopeFactory = scopeFactory;
      _logger = logger;
      _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      _logger.LogInformation("AuthDataRetentionService started.");

      try
      {
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
      }
      catch(TaskCanceledException)
      {
        return;
      }

      while (!stoppingToken.IsCancellationRequested)
      {
        try
        {
          await CleanupAsync(stoppingToken);
        }
        catch(Exception ex)
        {
          _logger.LogError(ex, "Unexpected error while cleaning up auth data.");
        }

        try
        {
          await Task.Delay(RunInterval, stoppingToken);
        }
        catch(TaskCanceledException)
        {
          return;
        }
      }

      _logger.LogInformation("AuthDataRetentionService stopped.");
    }

    private async Task CleanupAsync(CancellationToken stoppingToken)
    {
      using var scope = _scopeFactory.CreateScope();
      var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

      var authAttemptsDays = _config.GetValue<int?>("DataRetention:AuthAttemptsDays") ?? 30;
      var riskAssessmentsDays = _config.GetValue<int?>("DataRetention:LoginRiskAssessmentsDays") ?? 90;

      var authAttemptsCutoff = DateTime.UtcNow.AddDays(-authAttemptsDays);
      var riskAssessmentsCutoff = DateTime.UtcNow.AddDays(-riskAssessmentsDays);

      var deletedAttempts = await db.AuthAttempts
        .Where(x => x.Timestamp < authAttemptsCutoff)
        .ExecuteDeleteAsync(stoppingToken);

      var deletedAssessments = await db.LoginRiskAssessments
        .Where(x => x.Timestamp < riskAssessmentsCutoff)
        .ExecuteDeleteAsync(stoppingToken);

      if(deletedAttempts > 0 || deletedAssessments > 0)
      {
        _logger.LogInformation(
          "Data retention cleanup: removed {AuthAttempts} AuthAttempts (older than {AuthDays}d) and {RiskAssessments} LoginRiskAssessments (older than {RiskDays}d).",
          deletedAttempts,
          authAttemptsDays,
          deletedAssessments,
          riskAssessmentsDays
        );
      }
    }
  }
}