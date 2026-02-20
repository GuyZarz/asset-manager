using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("assets");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(a => a.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(a => a.Type).HasColumnName("type").HasMaxLength(20).HasConversion<string>().IsRequired();
        builder.Property(a => a.Quantity).HasColumnName("quantity").HasPrecision(18, 8).IsRequired();
        builder.Property(a => a.CostBasis).HasColumnName("cost_basis").HasPrecision(18, 2).IsRequired();
        builder.Property(a => a.CurrentPrice).HasColumnName("current_price").HasPrecision(18, 2).HasDefaultValue(0);
        builder.Property(a => a.Currency).HasColumnName("currency").HasMaxLength(3).IsRequired().HasDefaultValue("USD");
        builder.Property(a => a.Notes).HasColumnName("notes");
        builder.Property(a => a.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");

        // Soft-delete global filter
        builder.HasQueryFilter(a => !a.IsDeleted);

        // Indexes
        builder.HasIndex(a => a.UserId).HasDatabaseName("idx_assets_user_id");
        builder.HasIndex(a => a.Type).HasDatabaseName("idx_assets_type");
        builder.HasIndex(a => a.Currency).HasDatabaseName("idx_assets_currency");
        builder.HasIndex(a => new { a.UserId, a.Type })
            .HasDatabaseName("idx_assets_user_type")
            .HasFilter("NOT is_deleted");

        // 1:1 relationships with child tables
        builder.HasOne(a => a.CryptoDetails)
            .WithOne(c => c.Asset)
            .HasForeignKey<CryptoDetails>(c => c.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.StockDetails)
            .WithOne(s => s.Asset)
            .HasForeignKey<StockDetails>(s => s.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.RealEstateDetails)
            .WithOne(r => r.Asset)
            .HasForeignKey<RealEstateDetails>(r => r.AssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
