using AssetManager.Domain.DTOs;
using AssetManager.Domain.Entities;
using AssetManager.Infrastructure.Data;
using AssetManager.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace AssetManager.Infrastructure.Repositories;

public class PortfolioRepository
{
    private readonly AppDbContext _db;
    private readonly ExchangeRateService _exchangeRateService;

    public PortfolioRepository(AppDbContext db, ExchangeRateService exchangeRateService)
    {
        _db = db;
        _exchangeRateService = exchangeRateService;
    }

    public async Task<PortfolioSummary> GetSummaryAsync(int userId, string displayCurrency, CancellationToken ct = default)
    {
        var assets = await _db.Assets
            .Where(a => a.UserId == userId)
            .Select(a => new
            {
                a.Type,
                a.Currency,
                Value = a.CurrentPrice * a.Quantity,
                Cost = a.CostBasis * a.Quantity
            })
            .ToListAsync(ct);

        // Convert all values to display currency
        decimal totalValue = 0;
        decimal totalCost = 0;
        var assetsByType = new Dictionary<AssetType, (decimal Value, decimal Cost, int Count)>();

        foreach (var asset in assets)
        {
            var rate = await _exchangeRateService.GetRateAsync(asset.Currency, displayCurrency, ct);
            var convertedValue = asset.Value * rate;
            var convertedCost = asset.Cost * rate;

            totalValue += convertedValue;
            totalCost += convertedCost;

            if (!assetsByType.ContainsKey(asset.Type))
                assetsByType[asset.Type] = (0, 0, 0);

            var existing = assetsByType[asset.Type];
            assetsByType[asset.Type] = (existing.Value + convertedValue, existing.Cost + convertedCost, existing.Count + 1);
        }

        var totalGainLoss = totalValue - totalCost;
        var totalGainLossPercent = totalCost != 0 ? (totalGainLoss / totalCost) * 100 : 0;

        var byType = assetsByType
            .Select(kvp =>
            {
                var (value, cost, count) = kvp.Value;
                var gainLoss = value - cost;
                return new TypeBreakdown
                {
                    Type = kvp.Key,
                    Value = value,
                    Cost = cost,
                    GainLoss = gainLoss,
                    GainLossPercent = cost != 0 ? Math.Round((gainLoss / cost) * 100, 2) : 0,
                    AllocationPercent = totalValue != 0 ? Math.Round((value / totalValue) * 100, 2) : 0,
                    Count = count
                };
            })
            .OrderByDescending(t => t.Value)
            .ToList();

        return new PortfolioSummary
        {
            TotalValue = totalValue,
            TotalCost = totalCost,
            TotalGainLoss = totalGainLoss,
            TotalGainLossPercent = totalCost != 0 ? Math.Round(totalGainLossPercent, 2) : 0,
            AssetCount = assets.Count,
            DisplayCurrency = displayCurrency,
            ByType = byType
        };
    }

    public async Task EnsureTodaySnapshotAsync(int userId, string displayCurrency, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Use tracking context for writes
        var exists = await _db.PortfolioSnapshots
            .AnyAsync(s => s.UserId == userId && s.SnapshotDate == today, ct);

        if (exists) return;

        var assets = await _db.Assets
            .Where(a => a.UserId == userId)
            .Select(a => new
            {
                a.Type,
                a.Currency,
                Value = a.CurrentPrice * a.Quantity,
                Cost = a.CostBasis * a.Quantity
            })
            .ToListAsync(ct);

        // Convert all values to display currency
        decimal totalValue = 0;
        decimal totalCost = 0;
        decimal cryptoValue = 0;
        decimal stockValue = 0;
        decimal realEstateValue = 0;

        foreach (var asset in assets)
        {
            var rate = await _exchangeRateService.GetRateAsync(asset.Currency, displayCurrency, ct);
            var convertedValue = asset.Value * rate;
            var convertedCost = asset.Cost * rate;

            totalValue += convertedValue;
            totalCost += convertedCost;

            if (asset.Type == AssetType.Crypto)
                cryptoValue += convertedValue;
            else if (asset.Type == AssetType.Stock)
                stockValue += convertedValue;
            else if (asset.Type == AssetType.RealEstate)
                realEstateValue += convertedValue;
        }

        var snapshot = new PortfolioSnapshot
        {
            UserId = userId,
            SnapshotDate = today,
            TotalValue = totalValue,
            TotalCost = totalCost,
            CryptoValue = cryptoValue,
            StockValue = stockValue,
            RealEstateValue = realEstateValue,
            DisplayCurrency = displayCurrency
        };

        _db.PortfolioSnapshots.Add(snapshot);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<PortfolioSnapshotDto>> GetHistoryAsync(int userId, int days, CancellationToken ct = default)
    {
        var since = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

        return await _db.PortfolioSnapshots
            .Where(s => s.UserId == userId && s.SnapshotDate >= since)
            .OrderBy(s => s.SnapshotDate)
            .Select(s => new PortfolioSnapshotDto
            {
                Date = s.SnapshotDate,
                TotalValue = s.TotalValue,
                TotalCost = s.TotalCost,
                GainLoss = s.TotalValue - s.TotalCost,
                CryptoValue = s.CryptoValue,
                StockValue = s.StockValue,
                RealEstateValue = s.RealEstateValue,
                DisplayCurrency = s.DisplayCurrency
            })
            .ToListAsync(ct);
    }
}
