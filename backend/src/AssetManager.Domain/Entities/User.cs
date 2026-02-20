namespace AssetManager.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public required string GoogleId { get; set; }
    public string? GoogleEmail { get; set; }
    public required string Name { get; set; }
    public string? PictureUrl { get; set; }
    public string PreferredCurrency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Asset> Assets { get; set; } = [];
}
