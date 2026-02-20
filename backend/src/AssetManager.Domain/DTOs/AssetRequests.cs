using AssetManager.Domain.Entities;

namespace AssetManager.Domain.DTOs;

public record CreateAssetRequest
{
    public required string Name { get; init; }
    public required AssetType Type { get; init; }
    public required decimal Quantity { get; init; }
    public required decimal CostBasis { get; init; }
    public decimal CurrentPrice { get; init; }
    public string? Currency { get; init; }
    public string? Notes { get; init; }
    public CryptoDetailsDto? CryptoDetails { get; init; }
    public StockDetailsDto? StockDetails { get; init; }
    public RealEstateDetailsDto? RealEstateDetails { get; init; }
}

public record UpdateAssetRequest
{
    public string? Name { get; init; }
    public decimal? Quantity { get; init; }
    public decimal? CostBasis { get; init; }
    public decimal? CurrentPrice { get; init; }
    public string? Notes { get; init; }
    public CryptoDetailsDto? CryptoDetails { get; init; }
    public StockDetailsDto? StockDetails { get; init; }
    public RealEstateDetailsDto? RealEstateDetails { get; init; }
}

public record ValidateSymbolRequest
{
    public required AssetType Type { get; init; }
    public required string Symbol { get; init; }
    public string? Exchange { get; init; }
}

public record CryptoDetailsDto
{
    public required string Symbol { get; init; }
    public string? Network { get; init; }
    public string? WalletAddress { get; init; }
    public string? Exchange { get; init; }
    public bool Staking { get; init; }
}

public record StockDetailsDto
{
    public required string Symbol { get; init; }
    public string? Exchange { get; init; }
    public string? Sector { get; init; }
    public decimal DividendYield { get; init; }
}

public record RealEstateDetailsDto
{
    public required PropertyType PropertyType { get; init; }
    public required string Address { get; init; }
    public required string City { get; init; }
    public required string State { get; init; }
    public string? ZipCode { get; init; }
    public string? Country { get; init; }
    public required decimal PurchasePrice { get; init; }
    public decimal CurrentValue { get; init; }
    public decimal MortgageBalance { get; init; }
    public decimal MonthlyRent { get; init; }
    public decimal MonthlyExpenses { get; init; }
    public int? SquareFeet { get; init; }
    public int? Bedrooms { get; init; }
    public decimal? Bathrooms { get; init; }
    public int? YearBuilt { get; init; }
}
