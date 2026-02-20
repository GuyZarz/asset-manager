using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class CryptoDetailsConfiguration : IEntityTypeConfiguration<CryptoDetails>
{
    public void Configure(EntityTypeBuilder<CryptoDetails> builder)
    {
        builder.ToTable("crypto_details");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.AssetId).HasColumnName("asset_id").IsRequired();
        builder.Property(c => c.Symbol).HasColumnName("symbol").HasMaxLength(20).IsRequired();
        builder.Property(c => c.Network).HasColumnName("network").HasMaxLength(50);
        builder.Property(c => c.WalletAddress).HasColumnName("wallet_address").HasMaxLength(255);
        builder.Property(c => c.Exchange).HasColumnName("exchange").HasMaxLength(100);
        builder.Property(c => c.Staking).HasColumnName("staking").HasDefaultValue(false);

        builder.HasIndex(c => c.AssetId).IsUnique();
        builder.HasIndex(c => c.Symbol).HasDatabaseName("idx_crypto_symbol");
    }
}
