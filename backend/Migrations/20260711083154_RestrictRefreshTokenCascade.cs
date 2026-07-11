using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntryDotnetBoilerplate.Migrations
{
    /// <inheritdoc />
    public partial class RestrictRefreshTokenCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuthAttempts_Users_UserId",
                table: "AuthAttempts");

            migrationBuilder.AddForeignKey(
                name: "FK_AuthAttempts_Users_UserId",
                table: "AuthAttempts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuthAttempts_Users_UserId",
                table: "AuthAttempts");

            migrationBuilder.AddForeignKey(
                name: "FK_AuthAttempts_Users_UserId",
                table: "AuthAttempts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
