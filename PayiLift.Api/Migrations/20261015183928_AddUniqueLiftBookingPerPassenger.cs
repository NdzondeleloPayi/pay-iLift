
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PayiLift.Api.Migrations
{
    public partial class AddUniqueLiftBookingPerPassenger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create the composite index first so the foreign key
            // remains supported when the old index is removed.
            migrationBuilder.CreateIndex(
                name: "IX_LiftBookings_LiftOfferId_PassengerId",
                table: "LiftBookings",
                columns: new[] { "LiftOfferId", "PassengerId" },
                unique: true);

            migrationBuilder.DropIndex(
                name: "IX_LiftBookings_LiftOfferId",
                table: "LiftBookings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore the original foreign-key index before removing
            // the composite index.
            migrationBuilder.CreateIndex(
                name: "IX_LiftBookings_LiftOfferId",
                table: "LiftBookings",
                column: "LiftOfferId");

            migrationBuilder.DropIndex(
                name: "IX_LiftBookings_LiftOfferId_PassengerId",
                table: "LiftBookings");
        }
    }
}
