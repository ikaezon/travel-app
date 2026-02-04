-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in Supabase SQL Editor after creating tables
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEMPORARY PERMISSIVE POLICIES (Development)
-- These allow all operations for the anon role
-- REMOVE these and use the authenticated policies below
-- when you add Supabase Auth
-- ============================================

-- Users table
CREATE POLICY "Allow all for anon - users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Trips table
CREATE POLICY "Allow all for anon - trips" ON trips
  FOR ALL USING (true) WITH CHECK (true);

-- Timeline items table
CREATE POLICY "Allow all for anon - timeline_items" ON timeline_items
  FOR ALL USING (true) WITH CHECK (true);

-- Reservations table
CREATE POLICY "Allow all for anon - reservations" ON reservations
  FOR ALL USING (true) WITH CHECK (true);

-- Attachments table
CREATE POLICY "Allow all for anon - attachments" ON attachments
  FOR ALL USING (true) WITH CHECK (true);

-- User settings table
CREATE POLICY "Allow all for anon - user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- PRODUCTION POLICIES (Use when adding Supabase Auth)
-- Uncomment these and remove the permissive policies above
-- ============================================

/*
-- Drop temporary policies first
DROP POLICY IF EXISTS "Allow all for anon - users" ON users;
DROP POLICY IF EXISTS "Allow all for anon - trips" ON trips;
DROP POLICY IF EXISTS "Allow all for anon - timeline_items" ON timeline_items;
DROP POLICY IF EXISTS "Allow all for anon - reservations" ON reservations;
DROP POLICY IF EXISTS "Allow all for anon - attachments" ON attachments;
DROP POLICY IF EXISTS "Allow all for anon - user_settings" ON user_settings;

-- Users: can only view/update own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Trips: users can only access their own trips
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (user_id = auth.uid());

-- Timeline items: access via trip ownership
CREATE POLICY "Users can view timeline items for own trips" ON timeline_items
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert timeline items for own trips" ON timeline_items
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update timeline items for own trips" ON timeline_items
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete timeline items for own trips" ON timeline_items
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Reservations: access via trip ownership
CREATE POLICY "Users can view reservations for own trips" ON reservations
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert reservations for own trips" ON reservations
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update reservations for own trips" ON reservations
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete reservations for own trips" ON reservations
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Attachments: access via reservation -> trip ownership
CREATE POLICY "Users can view attachments for own reservations" ON attachments
  FOR SELECT USING (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN trips t ON r.trip_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for own reservations" ON attachments
  FOR INSERT WITH CHECK (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN trips t ON r.trip_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for own reservations" ON attachments
  FOR DELETE USING (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN trips t ON r.trip_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- User settings: users can only access their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());
*/
