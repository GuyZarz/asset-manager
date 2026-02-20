namespace AssetManager.Domain.Entities;

public class StockDetails
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public required string Symbol { get; set; }
    public string? Exchange { get; set; }
    public string? Sector { get; set; }
    public decimal DividendYield { get; set; }

    public Asset Asset { get; set; } = null!;
}
