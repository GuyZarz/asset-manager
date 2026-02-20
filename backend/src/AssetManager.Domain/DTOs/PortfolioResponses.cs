using AssetManager.Domain.Entities;

namespace AssetManager.Domain.DTOs;

public record PortfolioSummary
{
    public decimal TotalValue { get; init; }
    public decimal TotalCost { get; init; }
    public decimal TotalGainLoss { get; init; }
    public decimal TotalGainLossPercent { get; init; }
    public int AssetCount { get; init; }
    public string DisplayCurrency { get; init; } = "USD";
    public required IReadOnlyList<TypeBreakdown> ByType { get; init; }
}

public record TypeBreakdown
{
    public AssetType Type { get; init; }
    public decimal Value { get; init; }
    public decimal Cost { get; init; }
    public decimal GainLoss { get; init; }
    public decimal GainLossPercent { get; init; }
    public decimal AllocationPercent { get; init; }
    public int Count { get; init; }
}

public record PortfolioSnapshotDto
{
    public DateOnly Date { get; init; }
    public decimal TotalValue { get; init; }
    public decimal TotalCost { get; init; }
    public decimal GainLoss { get; init; }
    public decimal CryptoValue { get; init; }
    public decimal StockValue { get; init; }
    public decimal RealEstateValue { get; init; }
    public string DisplayCurrency { get; init; } = "USD";
}
