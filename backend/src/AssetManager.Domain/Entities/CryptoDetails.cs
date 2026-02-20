namespace AssetManager.Domain.Entities;

public class CryptoDetails
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public required string Symbol { get; set; }
    public string? Network { get; set; }
    public string? WalletAddress { get; set; }
    public string? Exchange { get; set; }
    public bool Staking { get; set; }

    public Asset Asset { get; set; } = null!;
}
