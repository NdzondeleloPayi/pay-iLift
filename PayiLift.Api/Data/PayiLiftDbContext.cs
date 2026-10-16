using Microsoft.EntityFrameworkCore;
using PayiLift.Api.Models;

namespace PayiLift.Api.Data;

public class PayiLiftDbContext : DbContext
{
    public PayiLiftDbContext(
        DbContextOptions<PayiLiftDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<LiftOffer> LiftOffers => Set<LiftOffer>();

    public DbSet<LiftBooking> LiftBookings => Set<LiftBooking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Each user email must be unique.
        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        // A driver can offer multiple lifts.
        modelBuilder.Entity<LiftOffer>()
            .HasOne(offer => offer.Driver)
            .WithMany()
            .HasForeignKey(offer => offer.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        // A lift offer can have multiple bookings.
        modelBuilder.Entity<LiftBooking>()
            .HasOne(booking => booking.LiftOffer)
            .WithMany(offer => offer.Bookings)
            .HasForeignKey(booking => booking.LiftOfferId)
            .OnDelete(DeleteBehavior.Restrict);

        // A passenger can make multiple bookings.
        modelBuilder.Entity<LiftBooking>()
            .HasOne(booking => booking.Passenger)
            .WithMany()
            .HasForeignKey(booking => booking.PassengerId)
            .OnDelete(DeleteBehavior.Restrict);
        // A passenger can book each lift offer only once.
        modelBuilder.Entity<LiftBooking>()
            .HasIndex(booking => new
            {
                booking.LiftOfferId,
                booking.PassengerId
            })
            .IsUnique();


        // Store monetary values using two decimal places.
        modelBuilder.Entity<LiftOffer>()
            .Property(offer => offer.PricePerSeat)
            .HasPrecision(10, 2);
    }
}