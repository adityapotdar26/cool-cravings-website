-- ============================================
-- COOL CRAVINGS - Supabase Schema Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT DEFAULT 'from-amber-900/30',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT DEFAULT '/placeholder.jpg',
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  taste TEXT,
  serving TEXT,
  benefits TEXT[] DEFAULT '{}',
  price_regular INTEGER DEFAULT 60,
  price_large INTEGER DEFAULT 80,
  price_premium INTEGER DEFAULT 100,
  available BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','ready','delivered','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES ('admin_password', 'coolcravings123') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('shop_open', 'true') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('whatsapp', '917058197979') ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read for collections and drinks
CREATE POLICY "public_read_collections" ON collections FOR SELECT USING (true);
CREATE POLICY "public_read_drinks" ON drinks FOR SELECT USING (true);

-- Full access for admin (via anon key)
CREATE POLICY "admin_insert_collections" ON collections FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_update_collections" ON collections FOR UPDATE USING (true);
CREATE POLICY "admin_delete_collections" ON collections FOR DELETE USING (true);
CREATE POLICY "admin_insert_drinks" ON drinks FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_update_drinks" ON drinks FOR UPDATE USING (true);
CREATE POLICY "admin_delete_drinks" ON drinks FOR DELETE USING (true);

-- Orders
CREATE POLICY "anyone_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_read_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE USING (true);

-- Settings
CREATE POLICY "read_settings" ON settings FOR SELECT USING (true);
CREATE POLICY "update_settings" ON settings FOR UPDATE USING (true);

-- Enable Realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================
-- SEED DATA - Existing Menu Items
-- ============================================

INSERT INTO collections (id, title, subtitle, theme, position) VALUES
('shakes','Shakes Collection','Rich · Creamy · Indulgent','from-amber-900/30',1),
('cold-coffee','Cold Coffee Collection','Bold · Smooth · Energising','from-stone-800/40',2),
('mojitos','Mojito Collection','Fresh · Fizzy · Refreshing','from-emerald-900/30',3),
('lassi','Lassi Collection','Creamy · Traditional · Cooling','from-yellow-900/30',4),
('buttermilk','Buttermilk Collection','Light · Spiced · Hydrating','from-slate-700/30',5)
ON CONFLICT DO NOTHING;

INSERT INTO drinks (collection_id,name,image_url,description,ingredients,taste,serving,price_regular,price_large,price_premium,position) VALUES
('shakes','Chocolate Shake','/shake-chocolate.jpeg','Rich Belgian chocolate blended with creamy milk.',ARRAY['Cocoa','Milk','Ice cream','Chocolate syrup'],'Rich & decadent','Chilled tall glass with whipped cream',70,90,110,1),
('shakes','Oreo Shake','/shake-oreo.jpeg','Crushed Oreo cookies in a velvety shake.',ARRAY['Oreo','Milk','Vanilla ice cream'],'Cookies & cream','Topped with cookie crumble',70,90,110,2),
('shakes','KitKat Shake','/shake-kitkat.jpeg','Crunchy KitKat wafers blended smooth.',ARRAY['KitKat','Milk','Ice cream'],'Crunchy chocolate','Garnished with KitKat fingers',70,90,110,3),
('shakes','Mango Shake','/shake-mango.jpeg','Alphonso mango pulp blended fresh.',ARRAY['Mango pulp','Milk','Sugar'],'Sweet & fruity','Chilled with mango bits',70,90,110,4),
('shakes','Strawberry Shake','/shake-strawberry.jpeg','Fresh strawberries whipped into cream.',ARRAY['Strawberry','Milk','Ice cream'],'Fresh & tangy','Topped with strawberry slice',70,90,110,5),
('shakes','Vanilla Shake','/shake-vanilla.jpeg','Classic Madagascar vanilla bean shake.',ARRAY['Vanilla','Milk','Ice cream'],'Smooth & classic','Simple and elegant',60,80,100,6),
('shakes','Butterscotch Shake','/shake-butterscotch.jpeg','Caramelised butterscotch indulgence.',ARRAY['Butterscotch','Milk','Praline'],'Caramel sweet','With praline crunch',70,90,110,7),
('shakes','Dry Fruit Shake','/shake-dryfruit.jpeg','Loaded with almonds, cashews and pistachios.',ARRAY['Almonds','Cashew','Pistachio','Milk'],'Nutty & rich','Garnished with chopped nuts',80,100,120,8),
('cold-coffee','Classic Cold Coffee','/coffee-classic.jpeg','Smooth brewed coffee served ice cold.',ARRAY['Coffee','Milk','Sugar','Ice'],'Bold & smooth','Tall glass with foam',60,80,100,1),
('cold-coffee','Chocolate Cold Coffee','/coffee-chocolate.jpeg','Coffee fused with dark chocolate.',ARRAY['Coffee','Chocolate','Milk'],'Mocha rich','With chocolate drizzle',70,90,110,2),
('cold-coffee','Caramel Cold Coffee','/coffee-caramel.jpeg','Buttery caramel meets cold brew.',ARRAY['Coffee','Caramel','Milk'],'Sweet caramel','Caramel swirl glass',70,90,110,3),
('cold-coffee','Ice Cream Cold Coffee','/coffee-icecream.jpeg','Topped with a scoop of vanilla ice cream.',ARRAY['Coffee','Ice cream','Milk'],'Creamy & cold','Affogato style',80,100,120,4),
('cold-coffee','Premium Cold Coffee','/coffee-premium.jpeg','Our signature triple-shot indulgence.',ARRAY['Espresso','Cream','Hazelnut'],'Intense & luxe','Crystal glass presentation',90,110,130,5),
('mojitos','Mint Mojito','/mojito-mint.jpeg','Fresh mint muddled with lime and soda.',ARRAY['Mint','Lime','Soda','Sugar'],'Cool & refreshing','Highball with crushed ice',50,70,90,1),
('mojitos','Blue Lagoon Mojito','/mojito-bluelagoon.jpeg','Electric blue citrus cooler.',ARRAY['Blue curacao syrup','Lime','Soda'],'Citrus tropical','Glowing blue glass',60,80,100,2),
('mojitos','Green Apple Mojito','/mojito-greenapple.jpeg','Crisp green apple with mint.',ARRAY['Green apple','Mint','Soda'],'Sweet & crisp','With apple slices',50,70,90,3),
('mojitos','Watermelon Mojito','/mojito-watermelon.jpeg','Juicy watermelon summer cooler.',ARRAY['Watermelon','Mint','Lime'],'Juicy & light','Watermelon garnish',50,70,90,4),
('mojitos','Strawberry Mojito','/mojito-strawberry.jpeg','Berry-forward minty refresher.',ARRAY['Strawberry','Mint','Soda'],'Berry fresh','With muddled berries',50,70,90,5),
('lassi','Sweet Lassi','/lassi-sweet.jpeg','Traditional sweet yogurt blend.',ARRAY['Yogurt','Sugar','Cardamom'],'Sweet & creamy','Earthen cup with cream',40,60,80,1),
('lassi','Mango Lassi','/lassi-mango.jpeg','Mango pulp churned with yogurt.',ARRAY['Mango','Yogurt','Sugar'],'Fruity & thick','Topped with saffron',50,70,90,2),
('lassi','Strawberry Lassi','/lassi-strawberry.jpeg','Berry twist on the classic lassi.',ARRAY['Strawberry','Yogurt'],'Tangy sweet','With berry coulis',50,70,90,3),
('lassi','Dry Fruit Lassi','/lassi-dryfruit.jpeg','Loaded with premium nuts and saffron.',ARRAY['Yogurt','Almonds','Pistachio','Saffron'],'Rich & nutty','Garnished with nuts',60,80,100,4),
('buttermilk','Classic Buttermilk','/buttermilk-classic.jpeg','Light, spiced traditional chaas.',ARRAY['Yogurt','Water','Cumin','Salt'],'Light & savoury','Chilled tall glass',30,45,60,1),
('buttermilk','Masala Buttermilk','/buttermilk-masala.jpeg','Spiced with mint, ginger and curry leaf.',ARRAY['Yogurt','Mint','Ginger','Curry leaf','Spices'],'Spiced & zesty','With coriander garnish',35,50,65,2)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION: Add note columns to orders
-- Run this if you already ran the schema above
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_note TEXT;
