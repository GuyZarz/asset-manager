# Database Schema

## Strategy: Base Table + Child Tables

Shared fields in `assets`, type-specific fields in detail tables joined by 1:1 FK.

## Tables

```sql
-- Users table (Google OAuth)
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    google_id       VARCHAR(255) UNIQUE NOT NULL,   -- Google sub claim
    google_email    VARCHAR(255),                    -- Email from Google
    name            VARCHAR(100) NOT NULL,           -- User's display name
    picture_url     VARCHAR(500),                    -- Google profile picture
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Base assets table (shared fields)
CREATE TABLE assets (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,        -- "Bitcoin", "Apple Inc.", "123 Main St"
    type            VARCHAR(20) NOT NULL,          -- Crypto, Stock, RealEstate
    quantity        DECIMAL(18,8) NOT NULL,        -- Units owned (1 for real estate)
    cost_basis      DECIMAL(18,2) NOT NULL,        -- Purchase price per unit
    current_price   DECIMAL(18,2) DEFAULT 0,       -- Latest market price
    notes           TEXT,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Crypto-specific details (1:1 with assets)
CREATE TABLE crypto_details (
    id              SERIAL PRIMARY KEY,
    asset_id        INT UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,          -- BTC, ETH, SOL
    network         VARCHAR(50),                   -- Ethereum, Solana, Bitcoin
    wallet_address  VARCHAR(255),                  -- Optional wallet tracking
    exchange        VARCHAR(100),                  -- Binance, Coinbase, etc.
    staking         BOOLEAN DEFAULT FALSE
);

-- Stock-specific details (1:1 with assets)
CREATE TABLE stock_details (
    id              SERIAL PRIMARY KEY,
    asset_id        INT UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,          -- AAPL, MSFT, TSLA
    exchange        VARCHAR(50),                   -- NYSE, NASDAQ
    sector          VARCHAR(100),                  -- Technology, Healthcare
    dividend_yield  DECIMAL(8,4) DEFAULT 0         -- Annual dividend %
);

-- Real estate-specific details (1:1 with assets)
CREATE TABLE real_estate_details (
    id              SERIAL PRIMARY KEY,
    asset_id        INT UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    -- Property
    property_type   VARCHAR(50) NOT NULL,          -- House, Apartment, Commercial, Land
    square_feet     INT,
    bedrooms        INT,
    bathrooms       DECIMAL(3,1),                  -- 2.5 baths
    year_built      INT,
    -- Address
    address         VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    zip_code        VARCHAR(20),
    country         VARCHAR(100) DEFAULT 'US',
    -- Financial
    purchase_price  DECIMAL(18,2) NOT NULL,
    current_value   DECIMAL(18,2) DEFAULT 0,
    mortgage_balance DECIMAL(18,2) DEFAULT 0,
    monthly_rent    DECIMAL(18,2) DEFAULT 0,       -- If rental property
    monthly_expenses DECIMAL(18,2) DEFAULT 0       -- Insurance, tax, maintenance
);
```

```sql
-- Portfolio snapshots (daily portfolio value history)
CREATE TABLE portfolio_snapshots (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date   DATE NOT NULL,
    total_value     DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_cost      DECIMAL(18,2) NOT NULL DEFAULT 0,
    crypto_value    DECIMAL(18,2) NOT NULL DEFAULT 0,
    stock_value     DECIMAL(18,2) NOT NULL DEFAULT 0,
    real_estate_value DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Indexes

```sql
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_user_type ON assets(user_id, type) WHERE NOT is_deleted;
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_crypto_symbol ON crypto_details(symbol);
CREATE INDEX idx_stock_symbol ON stock_details(symbol);
CREATE INDEX idx_real_estate_city ON real_estate_details(city, state);
CREATE UNIQUE INDEX ix_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);
CREATE INDEX ix_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date DESC);
```

## Relationships

```
users (1) ──── (N) assets                  -- User owns many assets
users (1) ──── (N) portfolio_snapshots     -- Daily portfolio value history
assets (1) ──── (0..1) crypto_details       -- Crypto fields
assets (1) ──── (0..1) stock_details        -- Stock fields
assets (1) ──── (0..1) real_estate_details  -- Real estate fields
```

## Key Constraints

- `google_id` unique on users (primary identifier from Google)
- `asset_id UNIQUE` on child tables enforces 1:1 relationship
- `ON DELETE CASCADE` propagates asset deletion to child details
- `symbol` lives in child tables (crypto/stock), not base table
- `quantity = 1` for real estate assets
- `DECIMAL(18,8)` for crypto quantities, `DECIMAL(18,2)` for fiat
- Soft deletes via `is_deleted` on base table
- No password storage — all authentication via Google OAuth 2.0
- `portfolio_snapshots` has unique constraint on `(user_id, snapshot_date)` — one per user per day
- Snapshots created on-demand when user visits dashboard (no cron job)

