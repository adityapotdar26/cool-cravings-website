import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epgzfowvtkwsofsyuuml.supabase.co';
const supabaseKey = 'sb_publishable_PFnYcRTGUIgNNAEvxSagtg__jq79lRT';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type DbOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: { name: string; size?: string; quantity: number; price: number }[];
  total_price: number;
  status: 'pending' | 'accepted' | 'ready' | 'delivered' | 'rejected';
  created_at: string;
  table_number?: number;
  session_id?: string;
  admin_note?: string;
  special_note?: string;
  payment_method?: string;
  payment_status?: string;
};

export type DbDrink = {
  id: string;
  collection_id: string;
  name: string;
  image_url: string;
  description: string;
  ingredients: string[];
  taste: string;
  serving: string;
  benefits: string[];
  price_regular: number;
  price_large: number;
  price_premium: number;
  available: boolean;
  position: number;
};

export type DbCollection = {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  position: number;
};

export type DbTable = {
  id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'preparing' | 'serving' | 'billing' | 'completed';
  created_at: string;
};

export type DbSession = {
  id: string;
  session_code: string;
  table_number: number;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  status: 'active' | 'billing' | 'completed';
  total_amount: number;
  payment_status: 'unpaid' | 'paid';
  started_at: string;
  ended_at: string | null;
  created_at: string;
};
