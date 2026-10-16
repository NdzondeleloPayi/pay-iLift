
using Microsoft.AspNetCore.Mvc;

namespace PayiLift.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "Pay-iLift API",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
