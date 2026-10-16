using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace PayiLift.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLiftOffersAndBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiftOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    Origin = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    Destination = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    DepartureTimeUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AvailableSeats = table.Column<int>(type: "int", nullable: false),
                    PricePerSeat = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiftOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiftOffers_Users_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LiftBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    LiftOfferId = table.Column<int>(type: "int", nullable: false),
                    PassengerId = table.Column<int>(type: "int", nullable: false),
                    SeatsRequested = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiftBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiftBookings_LiftOffers_LiftOfferId",
                        column: x => x.LiftOfferId,
                        principalTable: "LiftOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LiftBookings_Users_PassengerId",
                        column: x => x.PassengerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_LiftBookings_LiftOfferId",
                table: "LiftBookings",
                column: "LiftOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_LiftBookings_PassengerId",
                table: "LiftBookings",
                column: "PassengerId");

            migrationBuilder.CreateIndex(
                name: "IX_LiftOffers_DriverId",
                table: "LiftOffers",
                column: "DriverId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LiftBookings");

            migrationBuilder.DropTable(
                name: "LiftOffers");
        }
    }
}
