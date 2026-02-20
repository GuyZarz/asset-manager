# Security Rules

## Authentication (Google OAuth 2.0)
- Google ID token verified server-side; `google_id` (sub claim) stored in users table
- Session token in httpOnly cookie (`Secure`, `SameSite=Strict`) — never use localStorage/sessionStorage
- No passwords stored — Google handles credential security
- Session expires after 24 hours, auto-refresh on activity

## Validation
- **Backend validates everything** — never trust frontend
- Whitelist asset types, validate ranges/formats
- Parameterized queries only (EF Core) — no raw SQL concatenation

## Data Protection
- Never log tokens, secrets, or API keys
- Mask sensitive data in error responses
- HTTPS enforced, DB connections encrypted with SSL
- Secrets only in environment variables — never commit `.env`

## Authorization
- Verify user owns resource on every request
- Check `userId` matches authenticated user before CRUD
- Return 404 (not 403) if user doesn't own resource (prevents enumeration)

## Attack Prevention
| Attack | Prevention |
|--------|-----------|
| SQL Injection | Parameterized queries (EF Core) |
| XSS | React auto-escaping, CSP headers |
| CSRF | httpOnly cookies, SameSite flag |
| Brute force | Rate limit auth endpoints (10/min per IP) |

## Dependencies
- Regularly run `npm audit` and `dotnet list package --vulnerable`
