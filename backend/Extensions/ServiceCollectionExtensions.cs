using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

using Entry.Auth.Configuration;
using Entry.Auth.Data;
using Entry.Auth.Models;
using Entry.Auth.Services;

namespace Entry.Auth.Extensions
{
  public static class ServiceCollectionExtensions
  {
    public static IServiceCollection AddAppDbContext(
      this IServiceCollection services,
      IConfiguration config
    )
    {
      services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(
          config.GetConnectionString("Default"),
          sql =>
          {
            sql.EnableRetryOnFailure(
              maxRetryCount: 5,
              maxRetryDelay: TimeSpan.FromSeconds(10),
              errorNumbersToAdd: null
            );

            sql.MigrationsAssembly(typeof(Program).Assembly.FullName);
          }
        )
      );

      return services;
    }

    public static IServiceCollection AddAppIdentity(
      this IServiceCollection services
    )
    {
      services.AddIdentity<AppUser, IdentityRole>(options =>
      {
        IdentityConfig.ConfigureIdentityOptions(options);
      })
      .AddRoles<IdentityRole>()
      .AddEntityFrameworkStores<AppDbContext>()
      .AddDefaultTokenProviders()
      .AddSignInManager()
      .AddUserManager<UserManager<AppUser>>()
      .AddRoleManager<RoleManager<IdentityRole>>();

      return services;
    }

    public static IServiceCollection AddJwtAuthentication(
      this IServiceCollection services,
      IConfiguration config
    )
    {
      var key = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

      services.AddAuthentication(options =>
      {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
      })
      .AddJwtBearer(options =>
      {
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateIssuerSigningKey= true,
          ValidateLifetime = true,
          ValidateActor = true,
          RequireExpirationTime = true,
          RequireSignedTokens = true,
          ValidateTokenReplay = true,

          ValidIssuer = config["Jwt:Issuer"],
          ValidAudience = config["Jwt:Audience"],
          IssuerSigningKey = new SymmetricSecurityKey(key),

          ClockSkew = TimeSpan.Zero,
        };

        options.Events = new JwtBearerEvents
        {
          OnMessageReceived = context =>
          {
            // Prioritera nyss-refreshad token från denna request (satt av SilentRefreshMiddleware)
            /* if (context.HttpContext.Items.TryGetValue("AccessToken", out var refreshed) && refreshed is string s)
            {
              context.Token = s;
              return Task.CompletedTask;
            } */

            if (context.Request.Cookies.TryGetValue("accessToken", out var token))
              context.Token = token;

            return Task.CompletedTask;
          },

          OnTokenValidated = context =>
          {
            var purpose = context.Principal?.FindFirst("purpose")?.Value;

            if(purpose == "2fa")
            {
              context.Fail("Invalid token type.");
            }

            return Task.CompletedTask;
          }
        };
      });

      return services;
    }

    public static IServiceCollection AddAppServices(
      this IServiceCollection services
    )
    {
      services.AddScoped<IEmailService, EmailService>();
      services.AddScoped<IUserService, UserService>();
      services.AddScoped<IAuthService, AuthService>();
      services.AddScoped<IVerificationEmailService, VerificationEmailService>();
      services.AddScoped<IEmailChangeService, EmailChangeService>();
      services.AddScoped<IPasswordResetService, PasswordResetService>();

      services.AddScoped<IJwtService, JwtService>();
      services.AddScoped<IRefreshTokenService, RefreshTokenService>();
      services.AddScoped<ITwoFactorService, TwoFactorService>();
      services.AddScoped<IBruteForceService, BruteForceService>();

      services.AddHostedService<EmailVerificationRefreshService>();

      services.AddHttpClient();

      return services;
    }

    public static IServiceCollection AddAppAntiforgery(
      this IServiceCollection services,
      IWebHostEnvironment env
    )
    {
      services.AddAntiforgery(options =>
      {
        // Header som frontend måste skicka på varje muterande request
        options.HeaderName = "X-CSRF-TOKEN";

        // Cookien får INTE vara httpOnly - JS behöver kunna se att den finns
        // (själva värdet i cookien används internt av Antiforgery, frontend
        // skickar aldrig cookie-värdet självt, bara token:et från /csrf-token)
        options.Cookie.Name = "XSRF-TOKEN";
        options.Cookie.HttpOnly = false;
        options.Cookie.SameSite = SameSiteMode.Lax;

        // Secure kräver HTTPS för att webbläsaren ska spara cookien alls -
        // även på localhost. I dev (vanligtvis plain http) måste den vara
        // SameAsRequest, annars sparas cookien aldrig och CSRF-valideringen
        // saknar sin ena halva på varje request.
        options.Cookie.SecurePolicy = env.IsDevelopment()
          ? CookieSecurePolicy.SameAsRequest
          : CookieSecurePolicy.Always;
      });

      return services;
    }

    public static IServiceCollection AddAppAuthorization(
      this IServiceCollection services
    )
    {
      services.AddAuthorization(options =>
      {
        options.AddPolicy("Admin", policy =>
        {
          policy.RequireRole("Admin");
        });

        options.FallbackPolicy = new AuthorizationPolicyBuilder()
          .RequireAuthenticatedUser()
          .Build();
      });

      return services;
    }
  }
}
