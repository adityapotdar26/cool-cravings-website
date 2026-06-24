-- ============================================
-- TABLE MANAGEMENT SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- Restaurant tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','preparing','serving','billing','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dining sessions
CREATE TABLE IF NOT EXISTS dining_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  table_number INTEGER NOT NULL,
  table_id UUID REFERENCES restaurant_tables(id),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','billing','completed')),
  total_amount INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link orders to sessions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES dining_sessions(id);

-- Enable RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "public_read_tables" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "admin_all_tables" ON restaurant_tables FOR ALL USING (true);
CREATE POLICY "public_read_sessions" ON dining_sessions FOR SELECT USING (true);
CREATE POLICY "public_insert_sessions" ON dining_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_update_sessions" ON dining_sessions FOR UPDATE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE dining_sessions;

-- Seed default tables (1-10)
INSERT INTO restaurant_tables (table_number, capacity, status)
VALUES (1,4,'available'),(2,4,'available'),(3,2,'available'),
       (4,6,'available'),(5,4,'available'),(6,4,'available'),
       (7,2,'available'),(8,6,'available'),(9,4,'available'),(10,4,'available')
ON CONFLICT (table_number) DO NOTHING;
