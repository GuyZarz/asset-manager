# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Asset Manager

Asset tracking application for cryptocurrency, real estate, and stocks.

## Tech Stack

- **Frontend**: React 18+ with Vite + Tailwind CSS
- **Backend**: C# .NET 8 (ASP.NET Core)
- **Database**: PostgreSQL
- **State**: React Context API
- **Auth**: Google OAuth 2.0 (session cookies, no passwords stored)
- **Deploy**: Northflank (~$5-10/month)

## Architecture

### API Endpoints
```
GET    /api/auth/login, /api/auth/callback, /api/auth/profile
POST   /api/auth/logout
POST   /api/assets, GET /api/assets, PUT /api/assets/{id}, DELETE /api/assets/{id}
GET    /api/portfolio, /api/portfolio/performance, /api/portfolio/history
```

### Data Model (Base + Child Tables)
```
assets (base)  →  crypto_details   (symbol, network, exchange, wallet, staking)
               →  stock_details    (symbol, exchange, sector, dividend_yield)
               →  real_estate_details (property, address, financials)
```

### Data Flow
User logs in via Google → Session cookie set → Dashboard fetches portfolio → Context caches data → User adds/edits asset → API updates → Portfolio recalculates

### Key Patterns
- **Decimals for money** (never float) — 8 decimals crypto, 2 decimals fiat
- **UTC timestamps** in DB, timezone conversion on frontend
- **Backend validates everything** — Frontend provides UX feedback only
- **Asset types**: Base table + child tables (1:1 FK). Symbol in child tables, not base
- **Soft deletes** with IsDeleted flag for audit trail
- **Errors**: RFC 7807 Problem Details format

## Commands
Dev: `cd frontend && npm dev` | `cd backend && dotnet run`
Test: `npm test` | `dotnet test`
Format: `npm run format` | `dotnet format`
DB: `dotnet ef migrations add Name && dotnet ef database update`
Setup: `cp .env.example .env` — edit DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, VITE_API_BASE_URL
Deploy: push to `main` (CI/CD) | See `docs/deployment.md` for Northflank guide

⚠️ **Never commit `.env`**

## Documentation

- **[Database Schema](./rules/database.md)** — Tables, relationships, indexes
- **[Development & Git](./rules/development.md)** — Workflow, code style, testing
- **[UI/UX Design](./rules/ui-ux.md)** — Colors, layout, components, formatting
- **[API Design](./rules/api.md)** — Endpoints, validation, response formats
- **[Security](./rules/security.md)** — Auth, validation, data protection
