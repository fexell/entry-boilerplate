using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

using Entry.Auth.Models;

namespace Entry.Auth.Data
{
  public class AppDbContext : IdentityDbContext<AppUser, IdentityRole, string>
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<AuthAttempt> AuthAttempts { get; set; }

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

        entity.Property(x => x.Token).IsRequired();
        entity.Property(x => x.UserId).IsRequired();

        entity.HasIndex(x => x.Token).IsUnique();
        entity.HasIndex(x => x.UserId);

        entity.HasOne(x => x.User)
              .WithMany(u => u.RefreshTokens)
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.Restrict);
      });

      builder.Entity<UserSession>(entity =>
      {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.UserId).IsRequired();
        entity.Property(x => x.CreatedAt).IsRequired();
        entity.Property(x => x.LastUsedAt).IsRequired();

        entity.HasIndex(x => x.UserId);

        entity.HasOne(x => x.User)
              .WithMany(u => u.Sessions)
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.Cascade);
      });

      builder.Entity<AuthAttempt>(entity =>
      {
        entity.ToTable("AuthAttempts");

        entity.HasIndex(x => x.IpAddress);
        entity.HasIndex(x => x.Email);
        entity.HasIndex(x => x.Endpoint);
        entity.HasIndex(x => x.Timestamp);

        entity.Property(x => x.IpAddress).IsRequired();
        entity.Property(x => x.Endpoint).IsRequired();
      });
    }
  }
}
