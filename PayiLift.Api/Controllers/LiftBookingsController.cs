
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayiLift.Api.Data;
using PayiLift.Api.Models;

namespace PayiLift.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Passenger,Both")]
public class LiftBookingsController : ControllerBase
{
    private readonly PayiLiftDbContext _dbContext;

    public LiftBookingsController(PayiLiftDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // POST: api/liftbookings
    [HttpPost]
    public async Task<IActionResult> CreateBooking(
        [FromBody] CreateLiftBookingRequest request)
    {
        var passengerIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(passengerIdValue, out var passengerId))
        {
            return Unauthorized(new
            {
                message = "Unable to identify the authenticated user."
            });
        }

        if (request.LiftOfferId <= 0)
        {
            return BadRequest(new
            {
                message = "A valid lift offer is required."
            });
        }

        if (request.SeatsRequested < 1 ||
            request.SeatsRequested > 20)
        {
            return BadRequest(new
            {
                message = "Seats requested must be between 1 and 20."
            });
        }

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(
                IsolationLevel.ReadCommitted);

        try
        {
            // Lock the selected offer until this transaction completes.
            // Other booking requests for this offer must wait.
            var offer = await _dbContext.LiftOffers
                .FromSqlInterpolated(
                    $"SELECT * FROM LiftOffers WHERE Id = {request.LiftOfferId} FOR UPDATE")
                .SingleOrDefaultAsync();

            if (offer is null)
            {
                await transaction.RollbackAsync();

                return NotFound(new
                {
                    message = "The requested lift offer was not found."
                });
            }

            if (offer.DriverId == passengerId)
            {
                await transaction.RollbackAsync();

                return BadRequest(new
                {
                    message = "You cannot book your own lift offer."
                });
            }

            if (offer.Status != "Open")
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message = "This lift is no longer open for bookings."
                });
            }

            if (offer.DepartureTimeUtc <= DateTime.UtcNow)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message = "This lift's departure time has passed."
                });
            }

            var alreadyBooked = await _dbContext.LiftBookings
                .AnyAsync(booking =>
                    booking.LiftOfferId == offer.Id &&
                    booking.PassengerId == passengerId);

            if (alreadyBooked)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message = "You have already booked this lift."
                });
            }

            // Pending and Confirmed bookings both reserve seats.
            var bookedSeats = await _dbContext.LiftBookings
                .Where(booking =>
                    booking.LiftOfferId == offer.Id &&
                    (booking.Status == "Pending" ||
                     booking.Status == "Confirmed"))
                .SumAsync(booking =>
                    (int?)booking.SeatsRequested) ?? 0;

            var remainingSeats = offer.AvailableSeats - bookedSeats;

            if (request.SeatsRequested > remainingSeats)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message = "Not enough seats are available.",
                    remainingSeats = Math.Max(0, remainingSeats)
                });
            }

            var booking = new LiftBooking
            {
                LiftOfferId = offer.Id,
                PassengerId = passengerId,
                SeatsRequested = request.SeatsRequested,
                Status = "Pending",
                CreatedAtUtc = DateTime.UtcNow
            };

            _dbContext.LiftBookings.Add(booking);

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                booking.Id,
                booking.LiftOfferId,
                booking.PassengerId,
                booking.SeatsRequested,
                booking.Status,
                booking.CreatedAtUtc,
                remainingSeats = remainingSeats - booking.SeatsRequested
            });
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();

            // The unique database index is a final duplicate-booking
            // safeguard if a duplicate insert reaches the database.
            return Conflict(new
            {
                message = "This booking conflicts with an existing booking. Please check your bookings."
            });
        }
    }

    // GET: api/liftbookings
    // Returns bookings belonging only to the authenticated passenger.
    [HttpGet]
    public async Task<IActionResult> GetMyBookings()
    {
        var passengerIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(passengerIdValue, out var passengerId))
        {
            return Unauthorized(new
            {
                message = "Unable to identify the authenticated user."
            });
        }

        var bookings = await _dbContext.LiftBookings
            .AsNoTracking()
            .Where(booking => booking.PassengerId == passengerId)
            .OrderByDescending(booking => booking.CreatedAtUtc)
            .Select(booking => new
            {
                booking.Id,
                booking.LiftOfferId,
                booking.SeatsRequested,
                booking.Status,
                booking.CreatedAtUtc,
                Origin = booking.LiftOffer!.Origin,
                Destination = booking.LiftOffer!.Destination,
                DepartureTimeUtc =
                    booking.LiftOffer!.DepartureTimeUtc,
                PricePerSeat = booking.LiftOffer!.PricePerSeat
            })
            .ToListAsync();

        return Ok(bookings);
    }

}

public class CreateLiftBookingRequest
{
    public int LiftOfferId { get; set; }

    public int SeatsRequested { get; set; } = 1;
}
