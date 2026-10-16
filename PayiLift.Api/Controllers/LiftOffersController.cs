using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayiLift.Api.Data;
using PayiLift.Api.Models;

namespace PayiLift.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LiftOffersController : ControllerBase
{
    private readonly PayiLiftDbContext _dbContext;

    public LiftOffersController(PayiLiftDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET: api/liftoffers
    // Retrieve all open lift offers.
    [HttpGet]
    public async Task<IActionResult> GetOpenOffers()
    {
        var offers = await _dbContext.LiftOffers
            .AsNoTracking()
            .Where(offer => offer.Status == "Open")
            .OrderBy(offer => offer.DepartureTimeUtc)
            .Select(offer => new
            {
                offer.Id,
                offer.DriverId,
                offer.Origin,
                offer.Destination,
                offer.DepartureTimeUtc,
                offer.AvailableSeats,
                offer.PricePerSeat,
                offer.Status
            })
            .ToListAsync();

        return Ok(offers);
    }

    // POST: api/liftoffers
    // Publish a new lift offer.
    [Authorize(Roles = "Driver,Both")]
    [HttpPost]
    public async Task<IActionResult> CreateOffer(
        [FromBody] CreateLiftOfferRequest request)
    {
        var driverIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(driverIdValue, out var driverId))
        {
            return Unauthorized(new
            {
                message = "Unable to identify the authenticated user."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Origin) ||
            string.IsNullOrWhiteSpace(request.Destination))
        {
            return BadRequest(new
            {
                message = "Origin and destination are required."
            });
        }

        if (request.DepartureTimeUtc <= DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Departure time must be in the future."
            });
        }

        if (request.AvailableSeats < 1 ||
            request.AvailableSeats > 20)
        {
            return BadRequest(new
            {
                message = "Available seats must be between 1 and 20."
            });
        }

        if (request.PricePerSeat < 0 ||
            request.PricePerSeat > 100000)
        {
            return BadRequest(new
            {
                message = "Price per seat must be between R0 and R100,000."
            });
        }

        bool driverExists = await _dbContext.Users
            .AnyAsync(user => user.Id == driverId);

        if (!driverExists)
        {
            return BadRequest(new
            {
                message = "The authenticated user does not exist."
            });
        }

        var offer = new LiftOffer
        {
            DriverId = driverId,
            Origin = request.Origin.Trim(),
            Destination = request.Destination.Trim(),
            DepartureTimeUtc = request.DepartureTimeUtc,
            AvailableSeats = request.AvailableSeats,
            PricePerSeat = request.PricePerSeat,
            Status = "Open",
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.LiftOffers.Add(offer);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetOpenOffers),
            new { id = offer.Id },
            new
            {
                offer.Id,
                offer.DriverId,
                offer.Origin,
                offer.Destination,
                offer.DepartureTimeUtc,
                offer.AvailableSeats,
                offer.PricePerSeat,
                offer.Status
            });
    }
}

public class CreateLiftOfferRequest
{
    public string Origin { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public DateTime DepartureTimeUtc { get; set; }

    public int AvailableSeats { get; set; }

    public decimal PricePerSeat { get; set; }
}