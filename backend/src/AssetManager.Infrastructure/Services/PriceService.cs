using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AssetManager.Infrastructure.Services;

public class PriceService
{
    private readonly HttpClient _httpClient;

    public PriceService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // --- CRYPTO (CoinGecko) ---

    public async Task<CryptoLookupResult?> LookupCryptoAsync(string symbol, CancellationToken ct)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<CoinGeckoSearchResponse>(
                $"search?query={Uri.EscapeDataString(symbol)}", ct);

            if (response?.Coins is null || response.Coins.Count == 0)
                return null;

            // Find exact symbol match (case-insensitive)
            var match = response.Coins
                .FirstOrDefault(c => c.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase));

            if (match is null)
                return null;

            // Fetch price using the CoinGecko ID
            var price = await GetCryptoPriceAsync(match.Id, ct);

            return new CryptoLookupResult(match.Id, match.Symbol, match.Name, price ?? 0);
        }
        catch
        {
            return null;
        }
    }

    public async Task<decimal?> GetCryptoPriceAsync(string coingeckoId, CancellationToken ct)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<Dictionary<string, Dictionary<string, decimal>>>(
                $"simple/price?ids={Uri.EscapeDataString(coingeckoId)}&vs_currencies=usd", ct);

            if (response is not null && response.TryGetValue(coingeckoId, out var prices)
                && prices.TryGetValue("usd", out var usdPrice))
            {
                return usdPrice;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    // --- STOCKS (Yahoo Finance) ---

    public async Task<StockLookupResult?> LookupStockAsync(string symbol, string? exchange, CancellationToken ct)
    {
        try
        {
            var yahooSymbol = BuildYahooSymbol(symbol, exchange);
            var securities = await YahooFinanceApi.Yahoo.Symbols(yahooSymbol)
                .Fields(
                    YahooFinanceApi.Field.RegularMarketPrice,
                    YahooFinanceApi.Field.ShortName,
                    YahooFinanceApi.Field.Currency,
                    YahooFinanceApi.Field.FullExchangeName)
                .QueryAsync(ct);

            if (!securities.TryGetValue(yahooSymbol, out var security))
                return null;

            var price = (decimal)security.RegularMarketPrice;
            var name = security[YahooFinanceApi.Field.ShortName]?.ToString() ?? symbol;
            var currency = security[YahooFinanceApi.Field.Currency]?.ToString() ?? "USD";
            var fullExchange = security[YahooFinanceApi.Field.FullExchangeName]?.ToString() ?? "";

            return new StockLookupResult(yahooSymbol, name, price, currency, fullExchange);
        }
        catch
        {
            return null;
        }
    }

    public async Task<decimal?> GetStockPriceAsync(string symbol, string? exchange, CancellationToken ct)
    {
        var result = await LookupStockAsync(symbol, exchange, ct);
        return result?.Price;
    }

    private static string BuildYahooSymbol(string symbol, string? exchange)
    {
        if (string.IsNullOrEmpty(exchange))
            return symbol;

        return exchange.ToUpperInvariant() switch
        {
            "TASE" => $"{symbol}.TA",
            "LSE" or "LONDON" => $"{symbol}.L",
            "TSX" or "TORONTO" => $"{symbol}.TO",
            "ASX" or "SYDNEY" => $"{symbol}.AX",
            "XETRA" or "FRANKFURT" => $"{symbol}.DE",
            _ => symbol
        };
    }
}

// --- DTOs ---

public record CryptoLookupResult(string Id, string Symbol, string Name, decimal Price);
public record StockLookupResult(string Symbol, string Name, decimal Price, string Currency, string Exchange);

// CoinGecko response models
internal class CoinGeckoSearchResponse
{
    [JsonPropertyName("coins")]
    public List<CoinGeckoCoin> Coins { get; set; } = [];
}

internal class CoinGeckoCoin
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = "";

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("market_cap_rank")]
    public int? MarketCapRank { get; set; }
}
