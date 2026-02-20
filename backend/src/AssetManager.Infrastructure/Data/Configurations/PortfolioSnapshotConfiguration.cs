using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class PortfolioSnapshotConfiguration : IEntityTypeConfiguration<PortfolioSnapshot>
{
    public void Configure(EntityTypeBuilder<PortfolioSnapshot> builder)
    {
        builder.ToTable("portfolio_snapshots");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.UserId).HasColumnName("user_id");
        builder.Property(s => s.SnapshotDate).HasColumnName("snapshot_date");
        builder.Property(s => s.TotalValue).HasColumnName("total_value").HasColumnType("decimal(18,2)");
        builder.Property(s => s.TotalCost).HasColumnName("total_cost").HasColumnType("decimal(18,2)");
        builder.Property(s => s.CryptoValue).HasColumnName("crypto_value").HasColumnType("decimal(18,2)");
        builder.Property(s => s.StockValue).HasColumnName("stock_value").HasColumnType("decimal(18,2)");
        builder.Property(s => s.RealEstateValue).HasColumnName("real_estate_value").HasColumnType("decimal(18,2)");
        builder.Property(s => s.DisplayCurrency).HasColumnName("display_currency").HasMaxLength(3).IsRequired().HasDefaultValue("USD");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.UserId, s.SnapshotDate }).IsUnique();
        builder.HasIndex(s => s.SnapshotDate).IsDescending();
    }
}
