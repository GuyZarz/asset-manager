# Development & Git

## Common Commands

### Frontend
```bash
npm install && npm run dev           # Start dev server (localhost:5173)
npm test && npm run lint             # Test and lint
npm run build                        # Production build
npm run format && npm run lint --fix # Format code
```

### Backend
```bash
dotnet restore && dotnet run         # Start API (localhost:5000)
dotnet test                          # Run tests
dotnet ef migrations add NAME        # Create DB migration
dotnet ef database update            # Apply migrations
dotnet format                        # Format code
```

## Git Workflow

### Branch Naming
```
feature/add-dashboard    # New feature
fix/jwt-token-bug       # Bug fix
refactor/simplify-api   # Refactoring
docs/update-readme      # Documentation
```

### Commits (Conventional Commits)
```
feat(assets): Add bulk import CSV

Body: description of change
Footer: Closes #123
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### PR Process
1. Create branch: `git checkout -b feature/name`
2. Commit with conventional messages
3. Push: `git push origin feature/name`
4. Create PR with clear description
5. Run tests locally before requesting review
6. Squash and merge once approved

**Rule**: `main` branch is always production-ready. All tests must pass. Require PR review.

## Code Style

### Frontend (ESLint + Prettier)
```bash
npm run lint --fix && npm run format
```

### Backend (dotnet format)
```bash
dotnet format
```

### Standards
- **Naming**: camelCase variables, PascalCase public types
- **Indentation**: 2 spaces (frontend), 4 spaces (backend)
- **Line length**: Max 120 characters
- **Financial numbers**: `font-mono tabular-nums` (alignment)
- **Never**: Hardcoded secrets, trailing whitespace, console.log

## Testing

### Frontend (Vitest + React Testing Library)
```bash
npm test                # Run all tests
npm test -- --coverage  # With coverage
```

### Backend (xUnit)
```bash
dotnet test             # Run all tests
dotnet test --logger "console;verbosity=detailed"
```

**Coverage target**: 70% frontend, 80% backend
**Focus**: Business logic, validations, critical paths

## Common Workflows

### Adding a New Asset Type
1. Add to model
2. Create migration: `dotnet ef migrations add AddAssetType`
3. Update validation
4. Test calculations
5. Update form in frontend

### Adding a Portfolio Metric
1. Add calc logic in `PortfolioService`
2. Expose in API response
3. Add frontend component/chart
4. Test accuracy with known values

### Database Changes
```bash
# Create migration
dotnet ef migrations add DescriptiveNameHere

# Review migration, then apply
dotnet ef database update

# Rollback if needed
dotnet ef database update PreviousMigration
```
