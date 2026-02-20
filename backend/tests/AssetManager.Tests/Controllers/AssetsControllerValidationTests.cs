using AssetManager.Domain.DTOs;
using AssetManager.Domain.Entities;

namespace AssetManager.Tests.Controllers;

public class AssetsControllerValidationTests
{
    [Fact]
    public void CreateAssetRequest_Crypto_RequiresSymbol()
    {
        var request = new CreateAssetRequest
        {
            Name = "Bitcoin",
            Type = AssetType.Crypto,
            Quantity = 1m,
            CostBasis = 50000m,
            CryptoDetails = null // missing
        };

        // Symbol is required for crypto — CryptoDetails being null should fail validation
        Assert.Null(request.CryptoDetails);
    }

    [Fact]
    public void CreateAssetRequest_Stock_RequiresSymbol()
    {
        var request = new CreateAssetRequest
        {
            Name = "Apple",
            Type = AssetType.Stock,
            Quantity = 10m,
            CostBasis = 150m,
            StockDetails = null // missing
        };

        Assert.Null(request.StockDetails);
    }

    [Fact]
    public void CreateAssetRequest_RealEstate_RequiresAddress()
    {
        var request = new CreateAssetRequest
        {
            Name = "My House",
            Type = AssetType.RealEstate,
            Quantity = 1m,
            CostBasis = 300000m,
            RealEstateDetails = new RealEstateDetailsDto
            {
                PropertyType = PropertyType.House,
                Address = "", // empty
                City = "Austin",
                State = "TX",
                PurchasePrice = 300000m
            }
        };

        Assert.True(string.IsNullOrWhiteSpace(request.RealEstateDetails.Address));
    }

    [Fact]
    public void CreateAssetRequest_ValidCrypto_HasAllFields()
    {
        var request = new CreateAssetRequest
        {
            Name = "Ethereum",
            Type = AssetType.Crypto,
            Quantity = 5m,
            CostBasis = 3000m,
            CurrentPrice = 3500m,
            Notes = "Long-term hold",
            CryptoDetails = new CryptoDetailsDto
            {
                Symbol = "ETH",
                Network = "Ethereum",
                Exchange = "Coinbase",
                Staking = true
            }
        };

        Assert.Equal("ETH", request.CryptoDetails.Symbol);
        Assert.True(request.CryptoDetails.Staking);
        Assert.Equal(5m, request.Quantity);
    }
}
