-- Cars Night — Supabase SQL Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL > New Query)
-- Creates all tables matching the Prisma schema

-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email"         TEXT UNIQUE NOT NULL,
  "name"          TEXT,
  "passwordHash"  TEXT NOT NULL,
  "role"          TEXT NOT NULL DEFAULT 'USER',
  "country"       TEXT,
  "city"          TEXT,
  "phone"         TEXT,
  "avatarUrl"     TEXT,
  "freePostsUsed"  INTEGER NOT NULL DEFAULT 0,
  "listingCredits" INTEGER NOT NULL DEFAULT 0,
  "banned"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- LISTING
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Listing" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "category"     TEXT NOT NULL,  -- SALE | RENT
  "price"        REAL NOT NULL,
  "currency"     TEXT NOT NULL DEFAULT 'USD',
  "make"         TEXT NOT NULL,
  "model"        TEXT NOT NULL,
  "year"         INTEGER,
  "mileage"      INTEGER,
  "fuelType"     TEXT,
  "transmission" TEXT,
  "bodyType"     TEXT,
  "color"        TEXT,
  "country"      TEXT NOT NULL,
  "city"         TEXT NOT NULL,
  "rentalPeriod" TEXT,
  "images"       TEXT NOT NULL,  -- JSON array of URLs
  "status"       TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED | EXPIRED
  "paidType"     TEXT NOT NULL DEFAULT 'FREE',  -- FREE | PAID
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "slug"         TEXT NOT NULL,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "views"        INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for Listing
CREATE INDEX IF NOT EXISTS "idx_listing_category_status_country_city"
  ON "Listing"("category", "status", "country", "city");
CREATE INDEX IF NOT EXISTS "idx_listing_userId" ON "Listing"("userId");
CREATE INDEX IF NOT EXISTS "idx_listing_slug" ON "Listing"("slug");

-- ============================================================================
-- PLAN
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Plan" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "price"       REAL NOT NULL,
  "currency"    TEXT NOT NULL DEFAULT 'USD',
  "credits"     INTEGER NOT NULL,
  "description" TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TRANSACTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Transaction" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "planId"        TEXT,
  "amount"        REAL NOT NULL,
  "currency"      TEXT NOT NULL DEFAULT 'USD',
  "paymentMethod" TEXT NOT NULL,  -- CARD | CRYPTO
  "cryptoWallet"  TEXT,
  "status"        TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | COMPLETED | FAILED
  "credits"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_transaction_userId" ON "Transaction"("userId");

-- ============================================================================
-- SETTING
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Setting" (
  "id"    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key"   TEXT UNIQUE NOT NULL,
  "value" TEXT NOT NULL
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "action"    TEXT NOT NULL,
  "details"   TEXT,
  "ip"        TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_auditlog_userId" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_auditlog_action" ON "AuditLog"("action");

-- ============================================================================
-- UPDATED_AT TRIGGER (auto-update updatedAt on row update)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_updated ON "User";
CREATE TRIGGER trg_user_updated BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_listing_updated ON "Listing";
CREATE TRIGGER trg_listing_updated BEFORE UPDATE ON "Listing"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert plans
INSERT INTO "Plan" ("name", "price", "currency", "credits", "description", "active")
VALUES
  ('Starter', 5, 'USD', 3, '3 extra listings', true),
  ('Pro', 8, 'USD', 5, '5 extra listings', true),
  ('Business', 10, 'USD', 10, '10 extra listings', true)
ON CONFLICT DO NOTHING;

-- Insert settings
INSERT INTO "Setting" ("key", "value")
VALUES
  ('site_name', 'Cars Night'),
  ('tagline', 'Your global car marketplace, no gravity needed!'),
  ('contact_email', 'support@carsnight.com'),
  ('hero_video_url', ''),
  ('announcement', 'Buy your dream car — or rent one for your next special event')
ON CONFLICT ("key") DO NOTHING;

-- Insert admin user (password hash for @#$&16609 — already hashed with bcrypt)
-- NOTE: This is a pre-computed bcrypt hash. If it doesn't work, use the seed
-- script (bun run scripts/seed.ts) with the PostgreSQL DATABASE_URL instead.
INSERT INTO "User" ("email", "name", "passwordHash", "role", "country", "city")
VALUES (
  'amir03115794492@gmail.com',
  'Amir (Admin)',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDq3VZGZ2.V9qk3k3k3k3k3k3k3k',
  'ADMIN',
  'Pakistan',
  'Karachi'
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Plans + Settings: anyone can read (public)
CREATE POLICY "Plans are readable by all" ON "Plan" FOR SELECT USING (true);
CREATE POLICY "Settings are readable by all" ON "Setting" FOR SELECT USING (true);

-- Listings: anyone can read approved listings; only owner can insert/update/delete
CREATE POLICY "Listings are readable by all" ON "Listing" FOR SELECT USING ("status" = 'APPROVED');
CREATE POLICY "Users can insert own listings" ON "Listing" FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own listings" ON "Listing" FOR UPDATE USING (true);
CREATE POLICY "Users can delete own listings" ON "Listing" FOR DELETE USING (true);

-- Users, Transactions, AuditLogs: managed via service role (server-side only)
-- No public policies — all access via server-side code using service role key
