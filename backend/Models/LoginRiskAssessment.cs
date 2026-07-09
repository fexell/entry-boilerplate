

namespace Entry.Auth.Models
{
  public class LoginRiskAssessment
  {
    public long Id { get; set; }

    public string? UserId { get; set; }
    public string IpAddress { get; set; } = default!;
    public string? Country { get; set; }
    public string? DeviceFingerprint { get; set; }

    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = default!;

    public DateTime Timestamp { get; set; }
  }
}