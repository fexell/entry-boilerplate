using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using System.Globalization;

using Entry.Auth.Extensions;
using Entry.Auth.Services;
using Entry.Auth.Filters;
using Entry.Auth.Middlewares;

var builder = WebApplication.CreateBuilder(args);
var supportedCultures = new[] { "en", "sv" };

// -----------------------------------------------------
// CORS
// -----------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -----------------------------------------------------
// Services
// -----------------------------------------------------
builder.Services
    .AddAppDbContext(builder.Configuration)
    .AddAppIdentity()
    .AddJwtAuthentication(builder.Configuration)
    .AddAppServices()
    .AddAppAuthorization();

// builder.Services.AddHttpClient<IEmailService, EmailService>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// builder.Services.AddHostedService<EmailVerificationRefreshService>();

// -----------------------------------------------------
// Localization
// -----------------------------------------------------
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var cultures = supportedCultures.Select(c => new CultureInfo(c)).ToList();

    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = cultures;
    options.SupportedUICultures = cultures;

    options.RequestCultureProviders.Insert(0, new CustomRequestCultureProvider(async context =>
    {
        var lang = context.Request.Cookies["lang"];

        if(lang is "en" or "sv")
            return new ProviderCultureResult(lang);

        return null;
    }));
});

// -----------------------------------------------------
// Build
// -----------------------------------------------------
var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("Frontend");

// Silent refresh BEFORE authentication
// app.UseMiddleware<SilentRefreshMiddleware>();

var locOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>();
app.UseRequestLocalization(locOptions.Value);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
