using AssetManager.Domain.Entities;
using AssetManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetManager.Infrastructure.Repositories;

public class AssetRepository
{
    private readonly AppDbContext _db;

    public AssetRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Asset> CreateAsync(Asset asset, CancellationToken ct = default)
    {
        _db.Assets.Add(asset);
        await _db.SaveChangesAsync(ct);
        return asset;
    }

    public async Task<Asset?> GetByIdAsync(int id, int userId, CancellationToken ct = default)
    {
        return await _db.Assets
            .Include(a => a.CryptoDetails)
            .Include(a => a.StockDetails)
            .Include(a => a.RealEstateDetails)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, ct);
    }

    public async Task<(IReadOnlyList<Asset> Items, int Total)> ListAsync(
        int userId,
        AssetType? type = null,
        string? search = null,
        string? sortBy = null,
        string? sortDir = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = _db.Assets
            .Include(a => a.CryptoDetails)
            .Include(a => a.StockDetails)
            .Include(a => a.RealEstateDetails)
            .Where(a => a.UserId == userId);

        if (type.HasValue)
            query = query.Where(a => a.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.ToLower().Contains(search.ToLower()));

        var total = await query.CountAsync(ct);

        query = (sortBy?.ToLower(), sortDir?.ToLower()) switch
        {
            ("name", "asc") => query.OrderBy(a => a.Name),
            ("name", _) => query.OrderByDescending(a => a.Name),
            ("value", "asc") => query.OrderBy(a => a.CurrentPrice * a.Quantity),
            ("value", _) => query.OrderByDescending(a => a.CurrentPrice * a.Quantity),
            ("type", "asc") => query.OrderBy(a => a.Type),
            ("type", _) => query.OrderByDescending(a => a.Type),
            ("date", "asc") => query.OrderBy(a => a.CreatedAt),
            ("date", _) => query.OrderByDescending(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task UpdateAsync(Asset asset, CancellationToken ct = default)
    {
        asset.UpdatedAt = DateTime.UtcNow;
        _db.Assets.Update(asset);

        if (asset.CryptoDetails is not null)
            _db.CryptoDetails.Update(asset.CryptoDetails);
        if (asset.StockDetails is not null)
            _db.StockDetails.Update(asset.StockDetails);
        if (asset.RealEstateDetails is not null)
            _db.RealEstateDetails.Update(asset.RealEstateDetails);

        await _db.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Asset asset, CancellationToken ct = default)
    {
        asset.IsDeleted = true;
        asset.UpdatedAt = DateTime.UtcNow;
        _db.Assets.Update(asset);
        await _db.SaveChangesAsync(ct);
    }
}
