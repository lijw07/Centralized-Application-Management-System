using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Prototype.Data;

namespace Prototype.Controllers.Navigation;

[Route("[controller]")]
public class UserActivityNavigationController(SentinelContext context, ILogger<UserActivityNavigationController> logger)
    : BaseNavigationController(logger)
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            var skip = (page - 1) * pageSize;

            var logs = await context.UserActivityLogs
                .Include(log => log.User)
                .OrderByDescending(log => log.Timestamp)
                .Skip(skip)
                .Take(pageSize)
                .Select(log => new
                {
                    log.UserActivityLogId,
                    log.UserId,
                    Username = log.User != null ? log.User.Username : "Unknown User",
                    log.IpAddress,
                    log.DeviceInformation,
                    log.ActionType,
                    log.Description,
                    log.Timestamp
                })
                .ToListAsync();

            var totalCount = await context.UserActivityLogs.CountAsync();

            var result = CreatePaginatedResponse(logs, page, pageSize, totalCount);

            return Ok(result);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving user activity logs");
            return StatusCode(500, new { message = "An internal error occurred" });
        }
    }
}