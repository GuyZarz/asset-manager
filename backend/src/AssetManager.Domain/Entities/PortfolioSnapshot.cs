namespace AssetManager.Domain.Entities;

public class PortfolioSnapshot
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly SnapshotDate { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal CryptoValue { get; set; }
    public decimal StockValue { get; set; }
    public decimal RealEstateValue { get; set; }
    public string DisplayCurrency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
