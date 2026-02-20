using System.Security.Claims;
using AssetManager.Domain.DTOs;
using AssetManager.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetManager.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserRepository _repo;

    public UsersController(UserRepository repo)
    {
        _repo = repo;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var user = await _repo.GetByIdAsync(GetUserId(), ct);
        if (user is null)
            return NotFound(new { error = "User not found" });

        return Ok(new
        {
            success = true,
            data = new UserSettingsResponse
            {
                PreferredCurrency = user.PreferredCurrency
            },
            timestamp = DateTime.UtcNow
        });
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings(
        [FromBody] UpdateUserSettingsRequest request,
        CancellationToken ct)
    {
        // Validate currency code
        var validCurrencies = new[] { "USD", "ILS", "NIS", "EUR", "GBP", "CAD" };
        if (!validCurrencies.Contains(request.PreferredCurrency.ToUpperInvariant()))
        {
            return BadRequest(new
            {
                error = "Invalid currency code. Supported currencies: USD, ILS/NIS, EUR, GBP, CAD",
                timestamp = DateTime.UtcNow
            });
        }

        // Normalize NIS to ILS (both are valid for Israeli Shekel)
        var normalizedCurrency = request.PreferredCurrency.ToUpperInvariant() == "NIS"
            ? "ILS"
            : request.PreferredCurrency.ToUpperInvariant();

        await _repo.UpdatePreferredCurrencyAsync(GetUserId(), normalizedCurrency, ct);

        return Ok(new { success = true, timestamp = DateTime.UtcNow });
    }
}
