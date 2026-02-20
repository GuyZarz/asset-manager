using System.Security.Claims;
using AssetManager.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetManager.Api.Controllers;

[ApiController]
[Route("api/portfolio")]
[Authorize]
public class PortfolioController : ControllerBase
{
    private readonly PortfolioRepository _repo;
    private readonly UserRepository _userRepo;

    public PortfolioController(PortfolioRepository repo, UserRepository userRepo)
    {
        _repo = repo;
        _userRepo = userRepo;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _userRepo.GetByIdAsync(userId, ct);
        var displayCurrency = user?.PreferredCurrency ?? "USD";

        await _repo.EnsureTodaySnapshotAsync(userId, displayCurrency, ct);
        var summary = await _repo.GetSummaryAsync(userId, displayCurrency, ct);
        return Ok(new { success = true, data = summary, timestamp = DateTime.UtcNow });
    }

    [HttpGet("performance")]
    public async Task<IActionResult> GetPerformance(CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _userRepo.GetByIdAsync(userId, ct);
        var displayCurrency = user?.PreferredCurrency ?? "USD";

        var summary = await _repo.GetSummaryAsync(userId, displayCurrency, ct);
        return Ok(new
        {
            success = true,
            data = new
            {
                summary.TotalGainLoss,
                summary.TotalGainLossPercent,
                allocation = summary.ByType
            },
            timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int days = 30, CancellationToken ct = default)
    {
        if (days < 1) days = 1;
        if (days > 365) days = 365;

        var history = await _repo.GetHistoryAsync(GetUserId(), days, ct);
        return Ok(new { success = true, data = history, timestamp = DateTime.UtcNow });
    }
}
