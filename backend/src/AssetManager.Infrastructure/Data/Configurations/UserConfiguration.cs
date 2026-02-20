using AssetManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetManager.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.GoogleId).HasColumnName("google_id").HasMaxLength(255).IsRequired();
        builder.Property(u => u.GoogleEmail).HasColumnName("google_email").HasMaxLength(255);
        builder.Property(u => u.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(u => u.PictureUrl).HasColumnName("picture_url").HasMaxLength(500);
        builder.Property(u => u.PreferredCurrency).HasColumnName("preferred_currency").HasMaxLength(3).IsRequired().HasDefaultValue("USD");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");

        builder.HasIndex(u => u.GoogleId).IsUnique();

        builder.HasMany(u => u.Assets)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
