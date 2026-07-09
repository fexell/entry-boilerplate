using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entry.Auth.Models
{
  public class AuthAttempt
  {
    [Key]
    public long Id { get; set; }

    [MaxLength(450)]
    public string? UserId { get; set; }

    [MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(64)]
    public string? IpAddress { get; set; } = default!;

    [MaxLength(64)]
    public string Endpoint { get; set; } = default!;

    public bool Success { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public AppUser? User { get; set; }
  }
}