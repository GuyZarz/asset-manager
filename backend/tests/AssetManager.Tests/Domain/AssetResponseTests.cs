using AssetManager.Domain.DTOs;
using AssetManager.Domain.Entities;

namespace AssetManager.Tests.Domain;

public class AssetResponseTests
{
    [Fact]
    public void FromEntity_CalculatesGainLoss_Correctly()
    {
        var asset = new Asset
        {
            Id = 1,
            Name = "Bitcoin",
            Type = AssetType.Crypto,
            Quantity = 0.5m,
            CostBasis = 40000m,
            CurrentPrice = 50000m,
            UserId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CryptoDetails = new CryptoDetails
            {
                Symbol = "BTC",
                AssetId = 1
            }
        };

        var response = AssetResponse.FromEntity(asset);

        Assert.Equal(25000m, response.TotalValue);   // 0.5 * 50000
        Assert.Equal(20000m, response.TotalCost);     // 0.5 * 40000
        Assert.Equal(5000m, response.GainLoss);       // 25000 - 20000
        Assert.Equal(25m, response.GainLossPercent);  // (5000/20000) * 100
    }

    [Fact]
    public void FromEntity_ZeroCostBasis_ReturnsZeroPercent()
    {
        var asset = new Asset
        {
            Id = 1,
            Name = "Free Token",
            Type = AssetType.Crypto,
            Quantity = 100m,
            CostBasis = 0m,
            CurrentPrice = 10m,
            UserId = 1,
            CryptoDetails = new CryptoDetails { Symbol = "FREE", AssetId = 1 }
        };

        var response = AssetResponse.FromEntity(asset);

        Assert.Equal(1000m, response.TotalValue);
        Assert.Equal(0m, response.TotalCost);
        Assert.Equal(0m, response.GainLossPercent);
    }

    [Fact]
    public void FromEntity_Loss_ReturnsNegativeValues()
    {
        var asset = new Asset
        {
            Id = 1,
            Name = "Apple Inc.",
            Type = AssetType.Stock,
            Quantity = 10m,
            CostBasis = 200m,
            CurrentPrice = 150m,
            UserId = 1,
            StockDetails = new StockDetails { Symbol = "AAPL", AssetId = 1 }
        };

        var response = AssetResponse.FromEntity(asset);

        Assert.Equal(1500m, response.TotalValue);
        Assert.Equal(2000m, response.TotalCost);
        Assert.Equal(-500m, response.GainLoss);
        Assert.Equal(-25m, response.GainLossPercent);
    }

    [Fact]
    public void FromEntity_RealEstate_IncludesDetails()
    {
        var asset = new Asset
        {
            Id = 1,
            Name = "123 Main St",
            Type = AssetType.RealEstate,
            Quantity = 1m,
            CostBasis = 300000m,
            CurrentPrice = 350000m,
            UserId = 1,
            RealEstateDetails = new RealEstateDetails
            {
                AssetId = 1,
                PropertyType = PropertyType.House,
                Address = "123 Main St",
                City = "Austin",
                State = "TX",
                PurchasePrice = 300000m,
                CurrentValue = 350000m,
                MortgageBalance = 200000m,
                MonthlyRent = 2500m
            }
        };

        var response = AssetResponse.FromEntity(asset);

        Assert.NotNull(response.RealEstateDetails);
        Assert.Equal("Austin", response.RealEstateDetails!.City);
        Assert.Equal(PropertyType.House, response.RealEstateDetails.PropertyType);
        Assert.Null(response.CryptoDetails);
        Assert.Null(response.StockDetails);
    }
}
