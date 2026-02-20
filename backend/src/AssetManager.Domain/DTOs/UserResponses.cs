namespace AssetManager.Domain.DTOs;

public record UserSettingsResponse
{
    public string PreferredCurrency { get; init; } = "USD";
}

public record UpdateUserSettingsRequest
{
    public required string PreferredCurrency { get; init; }
}
