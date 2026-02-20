using System.Security.Claims;
using AssetManager.Domain.DTOs;
using AssetManager.Domain.Entities;
using AssetManager.Infrastructure.Repositories;
using AssetManager.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetManager.Api.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly AssetRepository _repo;
    private readonly PriceService _priceService;

    public AssetsController(AssetRepository repo, PriceService priceService)
    {
        _repo = repo;
        _priceService = priceService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateAssetRequest request,
        CancellationToken ct)
    {
        var errors = ValidateCreate(request);
        if (errors.Count > 0)
            return ValidationProblem(errors);

        // Auto-fetch price and currency for crypto/stock if not provided
        var currentPrice = request.CurrentPrice;
        var assetCurrency = request.Currency ?? "USD";

        if (currentPrice == 0)
        {
            if (request.Type == AssetType.Crypto && request.CryptoDetails is not null)
            {
                var lookup = await _priceService.LookupCryptoAsync(request.CryptoDetails.Symbol, ct);
                if (lookup is not null)
                {
                    currentPrice = lookup.Price;
                    assetCurrency = "USD"; // CoinGecko only returns USD prices
                }
            }
            else if (request.Type == AssetType.Stock && request.StockDetails is not null)
            {
                var stockLookup = await _priceService.LookupStockAsync(
                    request.StockDetails.Symbol, request.StockDetails.Exchange, ct);
                if (stockLookup is not null)
                {
                    currentPrice = stockLookup.Price;
                    assetCurrency = stockLookup.Currency; // Use currency from Yahoo Finance API
                }
            }
        }
        else if (request.Type == AssetType.Stock && request.StockDetails is not null && string.IsNullOrEmpty(request.Currency))
        {
            // If price is provided but currency is not, try to fetch currency from API
            var stockLookup = await _priceService.LookupStockAsync(
                request.StockDetails.Symbol, request.StockDetails.Exchange, ct);
            if (stockLookup is not null)
            {
                assetCurrency = stockLookup.Currency;
            }
        }

        // For real estate, determine currency based on country if not provided
        if (request.Type == AssetType.RealEstate && request.RealEstateDetails is not null && string.IsNullOrEmpty(request.Currency))
        {
            var country = request.RealEstateDetails.Country;
            if (country == "Israel" || country == "IL")
                assetCurrency = "ILS";
            else
                assetCurrency = "USD"; // Default to USD for other countries
        }

        var asset = new Asset
        {
            UserId = GetUserId(),
            Name = request.Name,
            Type = request.Type,
            Quantity = request.Type == AssetType.RealEstate ? 1 : request.Quantity,
            CostBasis = request.CostBasis,
            CurrentPrice = currentPrice,
            Currency = assetCurrency,
            Notes = request.Notes
        };

        switch (request.Type)
        {
            case AssetType.Crypto when request.CryptoDetails is not null:
                asset.CryptoDetails = new CryptoDetails
                {
                    Symbol = request.CryptoDetails.Symbol.ToUpperInvariant(),
                    Network = request.CryptoDetails.Network,
                    WalletAddress = request.CryptoDetails.WalletAddress,
                    Exchange = request.CryptoDetails.Exchange,
                    Staking = request.CryptoDetails.Staking
                };
                break;
            case AssetType.Stock when request.StockDetails is not null:
                asset.StockDetails = new StockDetails
                {
                    Symbol = request.StockDetails.Symbol.ToUpperInvariant(),
                    Exchange = request.StockDetails.Exchange,
                    Sector = request.StockDetails.Sector,
                    DividendYield = request.StockDetails.DividendYield
                };
                break;
            case AssetType.RealEstate when request.RealEstateDetails is not null:
                asset.RealEstateDetails = new RealEstateDetails
                {
                    PropertyType = request.RealEstateDetails.PropertyType,
                    Address = request.RealEstateDetails.Address,
                    City = request.RealEstateDetails.City,
                    State = request.RealEstateDetails.State,
                    ZipCode = request.RealEstateDetails.ZipCode,
                    Country = request.RealEstateDetails.Country ?? "US",
                    PurchasePrice = request.RealEstateDetails.PurchasePrice,
                    CurrentValue = request.RealEstateDetails.CurrentValue,
                    MortgageBalance = request.RealEstateDetails.MortgageBalance,
                    MonthlyRent = request.RealEstateDetails.MonthlyRent,
                    MonthlyExpenses = request.RealEstateDetails.MonthlyExpenses,
                    SquareFeet = request.RealEstateDetails.SquareFeet,
                    Bedrooms = request.RealEstateDetails.Bedrooms,
                    Bathrooms = request.RealEstateDetails.Bathrooms,
                    YearBuilt = request.RealEstateDetails.YearBuilt
                };
                break;
        }

        await _repo.CreateAsync(asset, ct);

        return CreatedAtAction(
            nameof(GetById),
            new { id = asset.Id },
            new { success = true, data = AssetResponse.FromEntity(asset), timestamp = DateTime.UtcNow });
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] AssetType? type,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        string? sortBy = null;
        string? sortDir = null;
        if (!string.IsNullOrEmpty(sort))
        {
            var parts = sort.Split(':');
            sortBy = parts[0];
            sortDir = parts.Length > 1 ? parts[1] : "desc";
        }

        var (items, total) = await _repo.ListAsync(
            GetUserId(), type, search, sortBy, sortDir, page, pageSize, ct);

        return Ok(new
        {
            success = true,
            data = new AssetListResponse
            {
                Items = items.Select(AssetResponse.FromEntity).ToList(),
                Total = total,
                Page = page,
                PageSize = pageSize,
                HasMore = page * pageSize < total
            },
            timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var asset = await _repo.GetByIdAsync(id, GetUserId(), ct);
        if (asset is null)
            return NotFound();

        return Ok(new { success = true, data = AssetResponse.FromEntity(asset), timestamp = DateTime.UtcNow });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateAssetRequest request,
        CancellationToken ct)
    {
        var asset = await _repo.GetByIdAsync(id, GetUserId(), ct);
        if (asset is null)
            return NotFound();

        if (request.Name is not null)
            asset.Name = request.Name;
        if (request.Quantity.HasValue && asset.Type != AssetType.RealEstate)
            asset.Quantity = request.Quantity.Value;
        if (request.CostBasis.HasValue)
            asset.CostBasis = request.CostBasis.Value;
        if (request.CurrentPrice.HasValue)
            asset.CurrentPrice = request.CurrentPrice.Value;
        if (request.Notes is not null)
            asset.Notes = request.Notes;

        if (request.CryptoDetails is not null && asset.CryptoDetails is not null)
        {
            asset.CryptoDetails.Symbol = request.CryptoDetails.Symbol.ToUpperInvariant();
            asset.CryptoDetails.Network = request.CryptoDetails.Network;
            asset.CryptoDetails.WalletAddress = request.CryptoDetails.WalletAddress;
            asset.CryptoDetails.Exchange = request.CryptoDetails.Exchange;
            asset.CryptoDetails.Staking = request.CryptoDetails.Staking;
        }

        if (request.StockDetails is not null && asset.StockDetails is not null)
        {
            asset.StockDetails.Symbol = request.StockDetails.Symbol.ToUpperInvariant();
            asset.StockDetails.Exchange = request.StockDetails.Exchange;
            asset.StockDetails.Sector = request.StockDetails.Sector;
            asset.StockDetails.DividendYield = request.StockDetails.DividendYield;
        }

        if (request.RealEstateDetails is not null && asset.RealEstateDetails is not null)
        {
            asset.RealEstateDetails.PropertyType = request.RealEstateDetails.PropertyType;
            asset.RealEstateDetails.Address = request.RealEstateDetails.Address;
            asset.RealEstateDetails.City = request.RealEstateDetails.City;
            asset.RealEstateDetails.State = request.RealEstateDetails.State;
            asset.RealEstateDetails.ZipCode = request.RealEstateDetails.ZipCode;
            asset.RealEstateDetails.Country = request.RealEstateDetails.Country ?? "US";
            asset.RealEstateDetails.PurchasePrice = request.RealEstateDetails.PurchasePrice;
            asset.RealEstateDetails.CurrentValue = request.RealEstateDetails.CurrentValue;
            asset.RealEstateDetails.MortgageBalance = request.RealEstateDetails.MortgageBalance;
            asset.RealEstateDetails.MonthlyRent = request.RealEstateDetails.MonthlyRent;
            asset.RealEstateDetails.MonthlyExpenses = request.RealEstateDetails.MonthlyExpenses;
            asset.RealEstateDetails.SquareFeet = request.RealEstateDetails.SquareFeet;
            asset.RealEstateDetails.Bedrooms = request.RealEstateDetails.Bedrooms;
            asset.RealEstateDetails.Bathrooms = request.RealEstateDetails.Bathrooms;
            asset.RealEstateDetails.YearBuilt = request.RealEstateDetails.YearBuilt;
        }

        await _repo.UpdateAsync(asset, ct);

        return Ok(new { success = true, data = AssetResponse.FromEntity(asset), timestamp = DateTime.UtcNow });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var asset = await _repo.GetByIdAsync(id, GetUserId(), ct);
        if (asset is null)
            return NotFound();

        await _repo.SoftDeleteAsync(asset, ct);

        return Ok(new { success = true, timestamp = DateTime.UtcNow });
    }

    [HttpPost("validate-symbol")]
    public async Task<IActionResult> ValidateSymbol(
        [FromBody] ValidateSymbolRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Symbol))
            return Ok(new { success = true, data = new { valid = false }, timestamp = DateTime.UtcNow });

        if (request.Type == AssetType.Crypto)
        {
            var result = await _priceService.LookupCryptoAsync(request.Symbol, ct);
            if (result is null)
                return Ok(new { success = true, data = new { valid = false }, timestamp = DateTime.UtcNow });

            return Ok(new
            {
                success = true,
                data = new
                {
                    valid = true,
                    name = result.Name,
                    currentPrice = result.Price,
                    currency = "USD"
                },
                timestamp = DateTime.UtcNow
            });
        }

        if (request.Type == AssetType.Stock)
        {
            var result = await _priceService.LookupStockAsync(request.Symbol, request.Exchange, ct);
            if (result is null)
                return Ok(new { success = true, data = new { valid = false }, timestamp = DateTime.UtcNow });

            return Ok(new
            {
                success = true,
                data = new
                {
                    valid = true,
                    name = result.Name,
                    currentPrice = result.Price,
                    currency = result.Currency,
                    exchange = result.Exchange
                },
                timestamp = DateTime.UtcNow
            });
        }

        return Ok(new { success = true, data = new { valid = false }, timestamp = DateTime.UtcNow });
    }

    private static Dictionary<string, string[]> ValidateCreate(CreateAssetRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
            errors["name"] = ["Name is required."];

        if (request.Quantity <= 0)
            errors["quantity"] = ["Quantity must be greater than 0."];

        if (request.CostBasis < 0)
            errors["costBasis"] = ["Cost basis must be >= 0."];

        switch (request.Type)
        {
            case AssetType.Crypto:
                if (request.CryptoDetails is null || string.IsNullOrWhiteSpace(request.CryptoDetails.Symbol))
                    errors["cryptoDetails.symbol"] = ["Symbol is required for crypto assets."];
                break;
            case AssetType.Stock:
                if (request.StockDetails is null || string.IsNullOrWhiteSpace(request.StockDetails.Symbol))
                    errors["stockDetails.symbol"] = ["Symbol is required for stock assets."];
                if (request.StockDetails?.DividendYield < 0)
                    errors["stockDetails.dividendYield"] = ["Dividend yield must be >= 0."];
                break;
            case AssetType.RealEstate:
                if (request.RealEstateDetails is null)
                {
                    errors["realEstateDetails"] = ["Real estate details are required."];
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.RealEstateDetails.Address))
                        errors["realEstateDetails.address"] = ["Address is required."];
                    if (string.IsNullOrWhiteSpace(request.RealEstateDetails.City))
                        errors["realEstateDetails.city"] = ["City is required."];
                    if (string.IsNullOrWhiteSpace(request.RealEstateDetails.State))
                        errors["realEstateDetails.state"] = ["State is required."];
                    if (request.RealEstateDetails.PurchasePrice <= 0)
                        errors["realEstateDetails.purchasePrice"] = ["Purchase price must be > 0."];
                }
                break;
        }

        return errors;
    }

    private IActionResult ValidationProblem(Dictionary<string, string[]> errors)
    {
        var problem = new ValidationProblemDetails(errors)
        {
            Type = "https://httpstatuses.com/400",
            Title = "Validation Error",
            Status = 400,
        };
        problem.Extensions["timestamp"] = DateTime.UtcNow;
        return BadRequest(problem);
    }
}
