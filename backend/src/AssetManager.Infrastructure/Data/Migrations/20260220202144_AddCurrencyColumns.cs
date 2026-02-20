using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssetManager.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mark the portfolio_snapshots table as having been created by a previous migration
            migrationBuilder.Sql(@"
                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                VALUES ('20260220182745_AddPortfolioSnapshots', '9.0.0')
                ON CONFLICT DO NOTHING;
            ");

            // Add currency column to users table
            migrationBuilder.AddColumn<string>(
                name: "preferred_currency",
                table: "users",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");

            // Add currency column to assets table
            migrationBuilder.AddColumn<string>(
                name: "currency",
                table: "assets",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");

            // Add currency index to assets table
            migrationBuilder.CreateIndex(
                name: "idx_assets_currency",
                table: "assets",
                column: "currency");

            // Add display_currency column to portfolio_snapshots table
            migrationBuilder.AddColumn<string>(
                name: "display_currency",
                table: "portfolio_snapshots",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "preferred_currency",
                table: "users");

            migrationBuilder.DropColumn(
                name: "currency",
                table: "assets");

            migrationBuilder.DropIndex(
                name: "idx_assets_currency",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "display_currency",
                table: "portfolio_snapshots");

            migrationBuilder.Sql(@"
                DELETE FROM ""__EFMigrationsHistory""
                WHERE ""MigrationId"" = '20260220182745_AddPortfolioSnapshots';
            ");
        }
    }
}
