-- ============================================
-- MIGRATION 2: Payment + Store Timing + Online Toggle
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_note TEXT;

INSERT INTO settings (key, value) VALUES ('open_time', '11:00') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('close_time', '23:00') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('open_days', '1,2,3,4,5,6,0') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('store_timing_mode', 'auto') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('razorpay_key_id', '') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('online_payment_enabled', 'false') ON CONFLICT DO NOTHING;
