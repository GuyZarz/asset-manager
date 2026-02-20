namespace AssetManager.Domain.Entities;

public class RealEstateDetails
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public PropertyType PropertyType { get; set; }
    public int? SquareFeet { get; set; }
    public int? Bedrooms { get; set; }
    public decimal? Bathrooms { get; set; }
    public int? YearBuilt { get; set; }
    public required string Address { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public string? ZipCode { get; set; }
    public string Country { get; set; } = "US";
    public decimal PurchasePrice { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal MortgageBalance { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal MonthlyExpenses { get; set; }

    public Asset Asset { get; set; } = null!;
}
