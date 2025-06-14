using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Prototype.Data;
using Prototype.Models;

namespace Prototype.Utility;

public class AuthenticatedUserAccessor(SentinelContext context) : IAuthenticatedUserAccessor
{
    public async Task<UserModel?> GetUserFromTokenAsync(ClaimsPrincipal user)
    {
        var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return null;

        return await context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<UserModel?> GetUser(string username, string password)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return null;

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

        return isPasswordValid ? user : null;
    }
    
    public async Task<bool> ValidateUser(string username, string password)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null)
            return false;

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }
    
    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await context.Users.AnyAsync(u => u.Username == username);
    }
    
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<TemporaryUserModel?> FindTemporaryUserByEmail(string email)
    {
        return await context.TemporaryUsers.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<UserModel?> FindUserByEmail(string email)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
    
    public async Task<UserRecoveryRequestModel?> FindUserRecoveryRequest(Guid userId)
    {
        return await context.UserRecoveryRequests.FirstOrDefaultAsync(u => u.UserId == userId);
    }
}