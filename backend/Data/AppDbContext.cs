using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

using Audwio.Projects;

using Entry.Auth.Models;

namespace Entry.Auth.Data
{
  public class AppDbContext : IdentityDbContext<AppUser, IdentityRole, string>
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<UserSession> UserSessions { get; set; } = null!;
    public DbSet<AuthAttempt> AuthAttempts { get; set; } = null!;
    public DbSet<LoginRiskAssessment> LoginRiskAssessments { get; set; } = null!;
    public DbSet<SocialLink> SocialLinks { get; set; } = null!;
    public DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
      base.OnModelCreating(builder);

      builder.Entity<AppUser>(entity =>
      {
        entity.ToTable("Users");

        entity.Property(x => x.CreatedAt).IsRequired();

        // Optional profile fields
        entity.Property(x => x.FirstName).HasMaxLength(64);
        entity.Property(x => x.LastName).HasMaxLength(64);
        entity.Property(x => x.Avatar).HasMaxLength(256);
        entity.Property(x => x.Premium).HasDefaultValue(false);
        entity.Property(x => x.WebsiteUrl).HasMaxLength(256);
      });

      builder.Entity<IdentityRole>(entity => entity.ToTable("Roles"));
      builder.Entity<IdentityUserRole<string>>(entity => entity.ToTable("UserRoles"));
      builder.Entity<IdentityUserClaim<string>>(entity => entity.ToTable("UserClaims"));
      builder.Entity<IdentityUserLogin<string>>(entity => entity.ToTable("UserLogins"));
      builder.Entity<IdentityRoleClaim<string>>(entity => entity.ToTable("RoleClaims"));
      builder.Entity<IdentityUserToken<string>>(entity => entity.ToTable("UserTokens"));

      builder.Entity<RefreshToken>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.Token).IsRequired().HasMaxLength(512);
        entity.Property(x => x.UserId).IsRequired();

        entity.HasIndex(x => x.Token).IsUnique();
        entity.HasIndex(x => x.UserId);
        entity.HasIndex(x => x.ReplacedByTokenId);

        entity.HasOne(x => x.User)
              .WithMany(u => u.RefreshTokens)
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.Restrict);

        // Self-referencing: points at the token this one was rotated into.
        // Restrict (not Cascade) - this table already restricts from User,
        // and EF Core disallows multiple cascade paths anyway.
        entity.HasOne<RefreshToken>()
              .WithMany()
              .HasForeignKey(x => x.ReplacedByTokenId)
              .OnDelete(DeleteBehavior.Restrict);
      });

      builder.Entity<UserSession>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.UserId).IsRequired();
        entity.Property(x => x.CreatedAt).IsRequired();
        entity.Property(x => x.LastUsedAt).IsRequired();

        entity.HasIndex(x => x.UserId);
        entity.HasIndex(x => x.LastUsedAt);

        entity.HasOne(x => x.User)
              .WithMany(u => u.Sessions)
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.Cascade);
      });

      builder.Entity<AuthAttempt>(entity =>
      {
        entity.ToTable("AuthAttempts");

        entity.HasIndex(x => new { x.IpAddress, x.Timestamp });
        entity.HasIndex(x => new { x.Email, x.Timestamp });
        entity.HasIndex(x => new { x.UserId, x.Timestamp });

        entity.HasIndex(x => x.Endpoint);

        entity.HasIndex(x => x.Timestamp);

        entity.Property(x => x.IpAddress).IsRequired();
        entity.Property(x => x.Endpoint).IsRequired();

        entity.HasOne(x => x.User)
          .WithMany()
          .HasForeignKey(x => x.UserId)
          .OnDelete(DeleteBehavior.SetNull);
      });

      builder.Entity<LoginRiskAssessment>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.IpAddress).HasMaxLength(64);
        entity.Property(x => x.Country).HasMaxLength(64);
        entity.Property(x => x.DeviceFingerprint).HasMaxLength(256);

        entity.Property(x => x.RiskLevel)
          .HasConversion<string>()
          .HasMaxLength(16);

        entity.HasIndex(x => x.UserId);
        entity.HasIndex(x => x.IpAddress);

        // NOTE: UserId was indexed but had no FK constraint, unlike AuthAttempt.
        // Assumes UserId is a nullable string with no navigation property on LoginRiskAssessment.
        // Adjust User type / nav property if that's not accurate for your model.
        entity.HasOne<AppUser>()
              .WithMany()
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.SetNull);
      });

      builder.Entity<SocialLink>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.UserId).IsRequired();
        entity.Property(x => x.Url).IsRequired().HasMaxLength(256);

        entity.HasIndex(x => x.UserId);

        entity.HasOne(x => x.User)
          .WithMany(u => u.SocialLinks)
          .HasForeignKey(x => x.UserId)
          .OnDelete(DeleteBehavior.Cascade);
      });

      builder.Entity<Project>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.OwnerId).IsRequired();
        entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
        entity.Property(x => x.Slug).IsRequired().HasMaxLength(120);
        entity.Property(x => x.Description).HasMaxLength(350);
        entity.Property(x => x.Genre).HasMaxLength(50);
        entity.Property(x => x.License).HasMaxLength(30);

        entity.Property(x => x.CoverImageUrl).HasMaxLength(2048);

        entity.Property(x => x.Visibility)
          .HasConversion<string>()
          .HasMaxLength(16);

        // Slugs only need to be unique within one owner's projects, not globally.
        entity.HasIndex(x => new { x.OwnerId, x.Slug }).IsUnique();

        // No nav-property collection on AppUser (matches the LoginRiskAssessment pattern
        // above) — add one there later if you want owner.Projects to be queryable directly.
        entity.HasOne(x => x.Owner)
              .WithMany()
              .HasForeignKey(x => x.OwnerId)
              .OnDelete(DeleteBehavior.Cascade);
      });
    }
  }
}
