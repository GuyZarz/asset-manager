using System.Security.Claims;
using AssetManager.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetManager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;

    public AuthController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl = "/")
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(Callback), new { returnUrl })
        };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? returnUrl = "/",
        CancellationToken ct = default)
    {
        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

        if (!result.Succeeded || result.Principal is null)
            return Unauthorized(new { success = false, error = "Authentication failed" });

        var googleId = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var name = result.Principal.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
        var email = result.Principal.FindFirstValue(ClaimTypes.Email);
        var picture = result.Principal.Claims.FirstOrDefault(c => c.Type == "picture")?.Value;

        var user = await _userService.UpsertFromGoogleAsync(googleId, name, email, picture, ct);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new("google_id", user.GoogleId),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.GoogleEmail ?? "")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
            });

        var frontendUrl = HttpContext.RequestServices
            .GetRequiredService<IConfiguration>()
            .GetValue<string>("FRONTEND_URL") ?? "http://localhost:5173";

        return Redirect($"{frontendUrl}{returnUrl}");
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { success = true, timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Dev-only: creates a test user session without Google OAuth.
    /// </summary>
    [HttpPost("dev-login")]
    public async Task<IActionResult> DevLogin(CancellationToken ct)
    {
        if (!HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
            return NotFound();

        var user = await _userService.UpsertFromGoogleAsync(
            "dev-user-001", "Dev User", "dev@localhost", null, ct);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new("google_id", user.GoogleId),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.GoogleEmail ?? "")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
            });

        return Ok(new { success = true, data = new { user.Id, user.Name, email = user.GoogleEmail }, timestamp = DateTime.UtcNow });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> Profile(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _userService.GetByIdAsync(userId, ct);
        if (user is null)
            return Unauthorized();

        return Ok(new
        {
            success = true,
            data = new
            {
                user.Id,
                user.Name,
                email = user.GoogleEmail,
                pictureUrl = user.PictureUrl
            },
            timestamp = DateTime.UtcNow
        });
    }
}
