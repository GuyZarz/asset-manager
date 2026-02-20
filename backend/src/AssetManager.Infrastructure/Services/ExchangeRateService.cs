using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace AssetManager.Infrastructure.Services;

public class ExchangeRateService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;

    public ExchangeRateService(HttpClient httpClient, IMemoryCache cache)
    {
        _httpClient = httpClient;
        _cache = cache;
    }

    public async Task<decimal> GetRateAsync(string fromCurrency, string toCurrency, CancellationToken ct = default)
    {
        if (string.Equals(fromCurrency, toCurrency, StringComparison.OrdinalIgnoreCase))
        {
            return 1.0m;
        }

        var cacheKey = $"exchange_rate_{fromCurrency}_{toCurrency}";
        if (_cache.TryGetValue<decimal>(cacheKey, out var cachedRate))
        {
            return cachedRate;
        }

        try
        {
            var response = await _httpClient.GetFromJsonAsync<ExchangeRateResponse>(
                $"latest/{fromCurrency}", ct);

            if (response?.Rates == null || !response.Rates.ContainsKey(toCurrency.ToUpperInvariant()))
            {
                throw new Exception($"Exchange rate not available for {fromCurrency} to {toCurrency}");
            }

            var rate = response.Rates[toCurrency.ToUpperInvariant()];

            // Cache for 1 hour
            _cache.Set(cacheKey, rate, TimeSpan.FromHours(1));

            return rate;
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Failed to fetch exchange rate from {fromCurrency} to {toCurrency}", ex);
        }
    }

    public async Task<decimal> ConvertAsync(
        decimal amount,
        string fromCurrency,
        string toCurrency,
        CancellationToken ct = default)
    {
        var rate = await GetRateAsync(fromCurrency, toCurrency, ct);
        return amount * rate;
    }
}

internal class ExchangeRateResponse
{
    [JsonPropertyName("rates")]
    public Dictionary<string, decimal> Rates { get; set; } = new();

    [JsonPropertyName("base")]
    public string Base { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;
}
