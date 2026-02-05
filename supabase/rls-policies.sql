ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon - users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon - trips" ON trips
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon - timeline_items" ON timeline_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon - reservations" ON reservations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon - attachments" ON attachments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon - user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);
