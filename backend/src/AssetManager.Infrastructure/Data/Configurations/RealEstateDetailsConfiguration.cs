using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class RealEstateDetailsConfiguration : IEntityTypeConfiguration<RealEstateDetails>
{
    public void Configure(EntityTypeBuilder<RealEstateDetails> builder)
    {
        builder.ToTable("real_estate_details");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.AssetId).HasColumnName("asset_id").IsRequired();
        builder.Property(r => r.PropertyType).HasColumnName("property_type").HasMaxLength(50).HasConversion<string>().IsRequired();
        builder.Property(r => r.SquareFeet).HasColumnName("square_feet");
        builder.Property(r => r.Bedrooms).HasColumnName("bedrooms");
        builder.Property(r => r.Bathrooms).HasColumnName("bathrooms").HasPrecision(3, 1);
        builder.Property(r => r.YearBuilt).HasColumnName("year_built");
        builder.Property(r => r.Address).HasColumnName("address").HasMaxLength(255).IsRequired();
        builder.Property(r => r.City).HasColumnName("city").HasMaxLength(100).IsRequired();
        builder.Property(r => r.State).HasColumnName("state").HasMaxLength(100).IsRequired();
        builder.Property(r => r.ZipCode).HasColumnName("zip_code").HasMaxLength(20);
        builder.Property(r => r.Country).HasColumnName("country").HasMaxLength(100).HasDefaultValue("US");
        builder.Property(r => r.PurchasePrice).HasColumnName("purchase_price").HasPrecision(18, 2).IsRequired();
        builder.Property(r => r.CurrentValue).HasColumnName("current_value").HasPrecision(18, 2).HasDefaultValue(0m);
        builder.Property(r => r.MortgageBalance).HasColumnName("mortgage_balance").HasPrecision(18, 2).HasDefaultValue(0m);
        builder.Property(r => r.MonthlyRent).HasColumnName("monthly_rent").HasPrecision(18, 2).HasDefaultValue(0m);
        builder.Property(r => r.MonthlyExpenses).HasColumnName("monthly_expenses").HasPrecision(18, 2).HasDefaultValue(0m);

        builder.HasIndex(r => r.AssetId).IsUnique();
        builder.HasIndex(r => new { r.City, r.State }).HasDatabaseName("idx_real_estate_city");
    }
}
