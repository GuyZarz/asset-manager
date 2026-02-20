using AssetManager.Domain.Entities;

namespace AssetManager.Domain.DTOs;

public record AssetResponse
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public AssetType Type { get; init; }
    public decimal Quantity { get; init; }
    public decimal CostBasis { get; init; }
    public decimal CurrentPrice { get; init; }
    public string Currency { get; init; } = "USD";
    public decimal TotalValue { get; init; }
    public decimal TotalCost { get; init; }
    public decimal GainLoss { get; init; }
    public decimal GainLossPercent { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public CryptoDetailsDto? CryptoDetails { get; init; }
    public StockDetailsDto? StockDetails { get; init; }
    public RealEstateDetailsDto? RealEstateDetails { get; init; }

    public static AssetResponse FromEntity(Asset asset)
    {
        var totalValue = asset.CurrentPrice * asset.Quantity;
        var totalCost = asset.CostBasis * asset.Quantity;
        var gainLoss = totalValue - totalCost;
        var gainLossPercent = totalCost != 0 ? (gainLoss / totalCost) * 100 : 0;

        return new AssetResponse
        {
            Id = asset.Id,
            Name = asset.Name,
            Type = asset.Type,
            Quantity = asset.Quantity,
            CostBasis = asset.CostBasis,
            CurrentPrice = asset.CurrentPrice,
            Currency = asset.Currency,
            TotalValue = totalValue,
            TotalCost = totalCost,
            GainLoss = gainLoss,
            GainLossPercent = Math.Round(gainLossPercent, 2),
            Notes = asset.Notes,
            CreatedAt = asset.CreatedAt,
            UpdatedAt = asset.UpdatedAt,
            CryptoDetails = asset.CryptoDetails is not null
                ? new CryptoDetailsDto
                {
                    Symbol = asset.CryptoDetails.Symbol,
                    Network = asset.CryptoDetails.Network,
                    WalletAddress = asset.CryptoDetails.WalletAddress,
                    Exchange = asset.CryptoDetails.Exchange,
                    Staking = asset.CryptoDetails.Staking
                }
                : null,
            StockDetails = asset.StockDetails is not null
                ? new StockDetailsDto
                {
                    Symbol = asset.StockDetails.Symbol,
                    Exchange = asset.StockDetails.Exchange,
                    Sector = asset.StockDetails.Sector,
                    DividendYield = asset.StockDetails.DividendYield
                }
                : null,
            RealEstateDetails = asset.RealEstateDetails is not null
                ? new RealEstateDetailsDto
                {
                    PropertyType = asset.RealEstateDetails.PropertyType,
                    Address = asset.RealEstateDetails.Address,
                    City = asset.RealEstateDetails.City,
                    State = asset.RealEstateDetails.State,
                    ZipCode = asset.RealEstateDetails.ZipCode,
                    Country = asset.RealEstateDetails.Country,
                    PurchasePrice = asset.RealEstateDetails.PurchasePrice,
                    CurrentValue = asset.RealEstateDetails.CurrentValue,
                    MortgageBalance = asset.RealEstateDetails.MortgageBalance,
                    MonthlyRent = asset.RealEstateDetails.MonthlyRent,
                    MonthlyExpenses = asset.RealEstateDetails.MonthlyExpenses,
                    SquareFeet = asset.RealEstateDetails.SquareFeet,
                    Bedrooms = asset.RealEstateDetails.Bedrooms,
                    Bathrooms = asset.RealEstateDetails.Bathrooms,
                    YearBuilt = asset.RealEstateDetails.YearBuilt
                }
                : null
        };
    }
}

public record AssetListResponse
{
    public required IReadOnlyList<AssetResponse> Items { get; init; }
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public bool HasMore { get; init; }
}
