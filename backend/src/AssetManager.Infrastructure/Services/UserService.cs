using AssetManager.Domain.Entities;
using AssetManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetManager.Infrastructure.Services;

public class UserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User> UpsertFromGoogleAsync(
        string googleId,
        string name,
        string? email,
        string? pictureUrl,
        CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsTracking()
            .FirstOrDefaultAsync(u => u.GoogleId == googleId, ct);

        if (user is null)
        {
            user = new User
            {
                GoogleId = googleId,
                Name = name,
                GoogleEmail = email,
                PictureUrl = pictureUrl
            };
            _db.Users.Add(user);
        }
        else
        {
            user.Name = name;
            user.GoogleEmail = email;
            user.PictureUrl = pictureUrl;
            user.UpdatedAt = DateTime.UtcNow;
            _db.Users.Update(user);
        }

        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId, ct);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }
}
