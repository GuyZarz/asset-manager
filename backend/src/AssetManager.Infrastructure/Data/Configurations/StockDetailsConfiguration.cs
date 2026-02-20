using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class StockDetailsConfiguration : IEntityTypeConfiguration<StockDetails>
{
    public void Configure(EntityTypeBuilder<StockDetails> builder)
    {
        builder.ToTable("stock_details");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.AssetId).HasColumnName("asset_id").IsRequired();
        builder.Property(s => s.Symbol).HasColumnName("symbol").HasMaxLength(20).IsRequired();
        builder.Property(s => s.Exchange).HasColumnName("exchange").HasMaxLength(50);
        builder.Property(s => s.Sector).HasColumnName("sector").HasMaxLength(100);
        builder.Property(s => s.DividendYield).HasColumnName("dividend_yield").HasPrecision(8, 4).HasDefaultValue(0m);

        builder.HasIndex(s => s.AssetId).IsUnique();
        builder.HasIndex(s => s.Symbol).HasDatabaseName("idx_stock_symbol");
    }
}
