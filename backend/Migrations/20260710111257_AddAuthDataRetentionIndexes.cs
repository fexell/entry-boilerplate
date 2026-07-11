using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntryDotnetBoilerplate.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthDataRetentionIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_Email",
                table: "AuthAttempts");

            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_IpAddress",
                table: "AuthAttempts");

            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_UserId",
                table: "AuthAttempts");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_Email_Timestamp",
                table: "AuthAttempts",
                columns: new[] { "Email", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_IpAddress_Timestamp",
                table: "AuthAttempts",
                columns: new[] { "IpAddress", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_UserId_Timestamp",
                table: "AuthAttempts",
                columns: new[] { "UserId", "Timestamp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_Email_Timestamp",
                table: "AuthAttempts");

            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_IpAddress_Timestamp",
                table: "AuthAttempts");

            migrationBuilder.DropIndex(
                name: "IX_AuthAttempts_UserId_Timestamp",
                table: "AuthAttempts");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_Email",
                table: "AuthAttempts",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_IpAddress",
                table: "AuthAttempts",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_AuthAttempts_UserId",
                table: "AuthAttempts",
                column: "UserId");
        }
    }
}
