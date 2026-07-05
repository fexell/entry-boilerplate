using Entry.Auth.Extensions;
using Entry.Auth.Services;
using Entry.Auth.Filters;
using Entry.Auth.Middlewares;

var builder = WebApplication.CreateBuilder(args);

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
