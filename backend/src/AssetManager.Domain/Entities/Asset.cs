namespace AssetManager.Domain.Entities;

public class Asset
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Name { get; set; }
    public AssetType Type { get; set; }
    public decimal Quantity { get; set; }
    public decimal CostBasis { get; set; }
    public decimal CurrentPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public CryptoDetails? CryptoDetails { get; set; }
    public StockDetails? StockDetails { get; set; }
    public RealEstateDetails? RealEstateDetails { get; set; }
}
