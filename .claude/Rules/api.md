# API Design

## Endpoints

```
GET    /api/auth/login             # Redirect to Google OAuth consent screen
GET    /api/auth/callback          # Google redirects here with code
POST   /api/auth/logout            # Invalidate session cookie
GET    /api/auth/profile           # Current user info

POST   /api/assets                 # Add asset
GET    /api/assets                 # List user's assets (?type=crypto&sort=value:desc)
GET    /api/assets/{id}            # Get single asset
PUT    /api/assets/{id}            # Update asset
DELETE /api/assets/{id}            # Soft delete asset

GET    /api/portfolio              # Portfolio summary (triggers daily snapshot)
GET    /api/portfolio/performance  # Gains/losses, allocation breakdown
GET    /api/portfolio/history      # Historical portfolio snapshots (?days=30)
```

## Response Formats

Success: `{ "success": true, "data": { ... }, "timestamp": "ISO8601" }`
Error: RFC 7807 Problem Details with `type`, `title`, `status`, `detail`, `errors`, `timestamp`

## Authentication (Google OAuth 2.0)

1. Frontend redirects to `/api/auth/login` → Google consent → `/api/auth/callback?code=...`
2. Backend exchanges code for ID token, creates/updates user, sets session cookie
3. All requests require session cookie (httpOnly, Secure, SameSite=Strict)
4. Logout: `POST /api/auth/logout` clears cookie and DB record
5. Return 404 (not 403) if user doesn't own resource (prevents enumeration)

## Pagination & Filtering

```
GET /api/assets?page=1&pageSize=20&sort=value:desc
GET /api/assets?type=crypto,stock&search=bitcoin&minValue=1000
```

Paginated response includes: `items`, `total`, `page`, `pageSize`, `hasMore`

## Validation Rules

### Base Asset (all types)
| Field | Rules |
|-------|-------|
| name | Required, non-empty string |
| type | Required, one of: Crypto, Stock, RealEstate |
| quantity | Required, > 0, decimal (1 for real estate) |
| costBasis | Required, >= 0, decimal |

### Crypto Details
| Field | Rules |
|-------|-------|
| symbol | Required (BTC, ETH, SOL) |
| network, walletAddress, exchange | Optional |

### Stock Details
| Field | Rules |
|-------|-------|
| symbol | Required (AAPL, MSFT) |
| exchange, sector | Optional |
| dividendYield | Optional, >= 0 |

### Real Estate Details
| Field | Rules |
|-------|-------|
| propertyType | Required: House, Apartment, Commercial, Land |
| address, city, state | Required |
| purchasePrice | Required, > 0 |
| squareFeet, bedrooms, bathrooms, yearBuilt | Optional |
| currentValue, mortgageBalance, monthlyRent, monthlyExpenses | Optional, >= 0 |

## Rate Limiting
- Auth endpoints: 10 req/min per IP
- API endpoints: 100 req/min per user