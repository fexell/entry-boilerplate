using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntryDotnetBoilerplate.Migrations
{
    /// <inheritdoc />
    public partial class AddFailureReasonAndUserAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailureReason",
                table: "AuthAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "AuthAttempts",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "AuthAttempts");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "AuthAttempts");
        }
    }
}
