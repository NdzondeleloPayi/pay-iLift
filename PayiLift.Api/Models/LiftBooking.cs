using System.ComponentModel.DataAnnotations;

namespace PayiLift.Api.Models;

public class LiftBooking
{
    public int Id { get; set; }

    public int LiftOfferId { get; set; }

    public int PassengerId { get; set; }

    public int SeatsRequested { get; set; } = 1;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public LiftOffer? LiftOffer { get; set; }

    public User? Passenger { get; set; }
}