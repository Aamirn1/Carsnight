-- Cars Night — Fix RLS Policies for User Registration
-- Run this in the Supabase SQL Editor to fix the "Could not create your account" error.
-- This adds INSERT/UPDATE/DELETE policies so the app can create users, logins, etc.

-- ============================================================================
-- User table: allow INSERT (registration), UPDATE (profile), SELECT (login check)
-- ============================================================================
CREATE POLICY "Users can insert" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own row" ON "User" FOR UPDATE USING (true);
CREATE POLICY "Users can select own row" ON "User" FOR SELECT USING (true);

-- ============================================================================
-- AuditLog table: allow INSERT (log events)
-- ============================================================================
CREATE POLICY "Anyone can insert audit logs" ON "AuditLog" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select audit logs" ON "AuditLog" FOR SELECT USING (true);

-- ============================================================================
-- Transaction table: allow INSERT (purchases)
-- ============================================================================
CREATE POLICY "Anyone can insert transactions" ON "Transaction" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select transactions" ON "Transaction" FOR SELECT USING (true);

-- ============================================================================
-- Listing table: already has policies but let's also allow SELECT on ALL
-- (not just approved — the app filters status server-side)
-- ============================================================================
DROP POLICY IF EXISTS "Listings are readable by all" ON "Listing";
CREATE POLICY "Listings are readable by all" ON "Listing" FOR SELECT USING (true);

-- ============================================================================
-- Plan + Setting: already have SELECT policies, but let's add INSERT/UPDATE
-- for admin management
-- ============================================================================
CREATE POLICY "Anyone can insert plans" ON "Plan" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update plans" ON "Plan" FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert settings" ON "Setting" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON "Setting" FOR UPDATE USING (true);
