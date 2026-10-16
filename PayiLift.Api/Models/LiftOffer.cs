using System.ComponentModel.DataAnnotations;

namespace PayiLift.Api.Models;

public class LiftOffer
{
    public int Id { get; set; }

    public int DriverId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Origin { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Destination { get; set; } = string.Empty;

    public DateTime DepartureTimeUtc { get; set; }

    public int AvailableSeats { get; set; }

    public decimal PricePerSeat { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Open";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User? Driver { get; set; }

    public ICollection<LiftBooking> Bookings { get; set; }
        = new List<LiftBooking>();
}