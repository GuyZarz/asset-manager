-- Add the missing AddPortfolioSnapshots migration to history
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260220182745_AddPortfolioSnapshots', '9.0.0')
ON CONFLICT DO NOTHING;
