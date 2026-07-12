using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EntryDotnetBoilerplate.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginRiskFkAndIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "RefreshTokens",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_LastUsedAt",
                table: "UserSessions",
                column: "LastUsedAt");

            migrationBuilder.AddForeignKey(
                name: "FK_LoginRiskAssessments_Users_UserId",
                table: "LoginRiskAssessments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoginRiskAssessments_Users_UserId",
                table: "LoginRiskAssessments");

            migrationBuilder.DropIndex(
                name: "IX_UserSessions_LastUsedAt",
                table: "UserSessions");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "RefreshTokens",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512);
        }
    }
}
