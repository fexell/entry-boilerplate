using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntryDotnetBoilerplate.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthAttempts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuthAttempts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Endpoint = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Success = table.Column<bool>(type: "bit", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuthAttempts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_Email",
                table: "AuthAttempts",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_Endpoint",
                table: "AuthAttempts",
                column: "Endpoint");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_IpAddress",
                table: "AuthAttempts",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_Timestamp",
                table: "AuthAttempts",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_UserId",
                table: "AuthAttempts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuthAttempts");
        }
    }
}
