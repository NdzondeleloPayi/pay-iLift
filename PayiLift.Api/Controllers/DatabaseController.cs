using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayiLift.Api.Data;

namespace PayiLift.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly PayiLiftDbContext _dbContext;

    public DatabaseController(PayiLiftDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            bool canConnect = await _dbContext.Database.CanConnectAsync();

            if (!canConnect)
            {
                return StatusCode(503, new
                {
                    status = "Unhealthy",
                    database = "MySQL"
                });
            }

            return Ok(new
            {
                status = "Healthy",
                database = "MySQL",
                connected = true
            });
        }
        catch
        {
            return StatusCode(503, new
            {
                status = "Unhealthy",
                database = "MySQL",
                connected = false
            });
        }
    }
}