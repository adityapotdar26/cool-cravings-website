'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { DbOrder } from '@/lib/supabase';
import Image from 'next/image';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', accepted: '#3b82f6', ready: '#10b981',
  delivered: '#6b7280', rejected: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  pending: '🔔 Waiting for confirmation...',
  accepted: '✅ Accepted! Being prepared...',
  ready: '🚀 Ready for pickup!',
  delivered: '✓ Delivered. Enjoy!',
  rejected: '✕ Order rejected. Please contact us.',
};

type StoreSettings = {
  open_time: string; close_time: string;
  open_days: string; store_timing_mode: string; online_payment_enabled: string;
};

function isStoreCurrentlyOpen(s: StoreSettings): boolean {
  if (s.store_timing_mode === 'open') return true;
  if (s.store_timing_mode === 'closed') return false;
  const now = new Date();
  const openDays = s.open_days.split(',').map(Number);
  if (!openDays.includes(now.getDay())) return false;
  const [oh, om] = s.open_time.split(':').map(Number);
  const [ch, cm] = s.close_time.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= (oh * 60 + om) && cur < (ch * 60 + cm);
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate short session code
function genSessionCode() {
  return 'S' + Date.now().toString(36).toUpperCase().slice(-5);
}

export default function CartDrawer() {
  const { items, removeFromCart, updateQty, clearCart, totalPrice, totalItems, isOpen, setIsOpen } = useCart();
  const { user, setAuthOpen, setAuthTab } = useAuth();

  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<DbOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [adminNote, setAdminNote] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [paymentMethod] = useState<'cod'>('cod');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [storeOpen, setStoreOpen] = useState(true);
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | ''>('');
  const [tableError, setTableError] = useState('');

  const fetchStoreSettings = useCallback(async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const s: Record<string, string> = {};
      data.forEach((r: { key: string; value: string }) => { s[r.key] = r.value; });
      const settings: StoreSettings = {
        open_time: s.open_time || '11:00', close_time: s.close_time || '23:00',
        open_days: s.open_days || '1,2,3,4,5,6,0',
        store_timing_mode: s.store_timing_mode || 'auto',
        online_payment_enabled: s.online_payment_enabled || 'false',
      };
      setStoreSettings(settings);
      setStoreOpen(isStoreCurrentlyOpen(settings));
      setOnlineEnabled(settings.online_payment_enabled === 'true');
    }
  }, []);

  useEffect(() => {
    fetchStoreSettings();
    const interval = setInterval(fetchStoreSettings, 60000);
    return () => clearInterval(interval);
  }, [fetchStoreSettings]);

  useEffect(() => {
    if (!placedOrder) return;
    const channel = supabase.channel(`order-${placedOrder.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${placedOrder.id}` },
        (payload) => {
          const updated = payload.new as DbOrder & { admin_note?: string };
          setOrderStatus(updated.status);
          if (updated.admin_note) setAdminNote(updated.admin_note);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [placedOrder]);

  // ── SESSION MANAGEMENT ──
  const getOrCreateSession = async (tNum: number, customerName: string, customerPhone: string) => {
    // Check for existing active session on this table
    const { data: existing } = await supabase
      .from('dining_sessions')
      .select('*')
      .eq('table_number', tNum)
      .eq('status', 'active')
      .maybeSingle();
    if (existing) return existing.id; // Reuse existing session

    // Get table id
    const { data: tableData } = await supabase
      .from('restaurant_tables')
      .select('id')
      .eq('table_number', tNum)
      .single();

    // Create new session
    const { data: newSession } = await supabase
      .from('dining_sessions')
      .insert({
        session_code: genSessionCode(),
        table_number: tNum,
        table_id: tableData?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        status: 'active',
        total_amount: totalPrice,
      })
      .select()
      .single();

    // Mark table as occupied
    await supabase
      .from('restaurant_tables')
      .update({ status: 'occupied' })
      .eq('table_number', tNum);

    return newSession?.id || null;
  };

  const handlePlaceOrder = async () => {
    if (!user) { setAuthTab('login'); setAuthOpen(true); setIsOpen(false); return; }
    if (items.length === 0) return;
    if (!tableNumber) { setTableError('Please enter your table number'); return; }
    if (Number(tableNumber) < 1 || Number(tableNumber) > 20) { setTableError('Table number must be between 1 and 20'); return; }
    setTableError('');
    setPlacing(true);

    const tNum = Number(tableNumber);
    const sessionId = await getOrCreateSession(tNum, user.name, user.phone);

    // Update session total
    if (sessionId) {
      const { data: sess } = await supabase.from('dining_sessions').select('total_amount').eq('id', sessionId).single();
      await supabase.from('dining_sessions').update({ total_amount: (sess?.total_amount || 0) + totalPrice }).eq('id', sessionId);
    }

    const orderItems = items.map(i => ({ name: i.drink.name, quantity: i.quantity, price: i.drink.price }));
    const { data, error } = await supabase.from('orders').insert({
      customer_name: user.name,
      customer_phone: user.phone,
      items: orderItems,
      total_price: totalPrice,
      status: 'pending',
      special_note: specialNote || null,
      payment_method: 'cod',
      payment_status: 'pending',
      table_number: tNum,
      session_id: sessionId,
    }).select().single();

    if (!error && data) { setPlacedOrder(data as DbOrder); setOrderStatus('pending'); clearCart(); }
    setPlacing(false);
  };

  const resetDrawer = () => {
    setPlacedOrder(null); setOrderStatus('pending');
    setAdminNote(''); setSpecialNote('');
    setTableNumber(''); setTableError('');
    setIsOpen(false);
  };

  const StoreClosed = () => {
    const days = storeSettings?.open_days.split(',').map(Number) || [];
    const openDayNames = DAY_NAMES.filter((_, i) => days.includes(i));
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        <div className="text-5xl">🔒</div>
        <h3 style={{ color: '#C9A65B' }} className="font-bold text-xl">Store is Closed</h3>
        <p className="text-primary/60 text-sm">We are not accepting orders right now.</p>
        <div className="rounded-xl border border-gold/20 px-5 py-4 w-full" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-gold/50 uppercase tracking-wider mb-2">Opening Hours</p>
          <p className="text-accent font-semibold">{storeSettings?.open_time} – {storeSettings?.close_time}</p>
          <p className="text-primary/50 text-xs mt-1">{openDayNames.join(' · ')}</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-sm text-gold border border-gold/30 rounded-full px-5 py-2 hover:bg-gold/10 transition">Browse Menu</button>
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => { if (!placedOrder) setIsOpen(false); }} />}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col transition-transform duration-300"
        style={{ background: 'linear-gradient(160deg,#1a0e00,#0d0700)', borderLeft: '1px solid rgba(201,166,91,0.2)', transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 px-5 py-4 flex-shrink-0">
          <h2 className="gold-text text-xl font-bold">
            {placedOrder ? 'Order Status' : `Your Cart ${totalItems > 0 ? `(${totalItems})` : ''}`}
          </h2>
          <div className="flex items-center gap-3">
            {storeSettings && (
              <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                style={{ background: storeOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: storeOpen ? '#10b981' : '#ef4444' }}>
                {storeOpen ? '● Open' : '● Closed'}
              </span>
            )}
            <button onClick={resetDrawer} className="text-2xl text-gold/70 hover:text-gold transition">✕</button>
          </div>
        </div>

        {/* ORDER STATUS VIEW */}
        {placedOrder ? (
          <div className="flex-1 flex flex-col px-5 py-6 gap-4 overflow-y-auto">
            <div className="text-center">
              <div className="text-5xl mb-3">
                {orderStatus === 'pending' ? '⏳' : orderStatus === 'accepted' ? '👨‍🍳' : orderStatus === 'ready' ? '🎉' : orderStatus === 'delivered' ? '✅' : '❌'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-black mb-2"
                style={{ background: STATUS_COLORS[orderStatus] || '#f59e0b' }}>
                {orderStatus.toUpperCase()}
              </div>
              <p className="text-sm text-primary/70 mt-2">{STATUS_LABELS[orderStatus] || 'Processing...'}</p>
              {adminNote && (
                <div className="mt-3 rounded-xl border border-gold/20 px-4 py-3 text-sm text-gold/90" style={{ background: 'rgba(201,166,91,0.08)' }}>
                  <span className="text-xs text-gold/50 block mb-1">Message from Cool Cravings:</span>
                  {adminNote}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-gold/15 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-gold/50 uppercase tracking-wider">Order #{placedOrder.id.slice(0, 8)}</p>
                {placedOrder.table_number && (
                  <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(201,166,91,0.12)', color: '#C9A65B' }}>
                    Table {placedOrder.table_number}
                  </span>
                )}
              </div>
              {(placedOrder.items || []).map((item: { name: string; quantity: number; price: number }, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gold/10 last:border-0">
                  <span className="text-primary/80">{item.name} ×{item.quantity}</span>
                  <span className="text-gold font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-3">
                <span className="text-accent">Total</span>
                <span className="text-gold">₹{placedOrder.total_price}</span>
              </div>
            </div>
            <p className="text-center text-xs text-primary/30">Updates automatically in real-time</p>
            {(orderStatus === 'delivered' || orderStatus === 'rejected') && (
              <button onClick={resetDrawer} className="w-full rounded-full py-3 font-semibold text-sm mt-auto"
                style={{ background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)', color: '#000' }}>Close</button>
            )}
          </div>

        ) : !storeOpen ? <StoreClosed /> : (
          <>
            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-primary/40">
                  <span className="text-5xl">🛒</span>
                  <p className="text-sm">Your cart is empty</p>
                  <button onClick={() => setIsOpen(false)} className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition">Browse Menu</button>
                </div>
              ) : items.map(item => (
                <div key={item.drink.name} className="flex gap-3 glass-card p-3 rounded-xl">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={item.drink.image} alt={item.drink.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-accent text-sm font-semibold truncate">{item.drink.name}</p>
                    <p className="text-xs text-gold/70">₹{item.drink.price} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.drink.name, item.quantity - 1)} className="w-6 h-6 rounded-full border border-gold/40 text-gold text-xs hover:bg-gold/20 transition flex items-center justify-center">−</button>
                        <span className="text-accent text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.drink.name, item.quantity + 1)} className="w-6 h-6 rounded-full border border-gold/40 text-gold text-xs hover:bg-gold/20 transition flex items-center justify-center">+</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gold font-semibold text-sm">₹{item.drink.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.drink.name)} className="text-red-400/70 hover:text-red-400 text-xs transition">✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            {items.length > 0 && (
              <div className="border-t border-gold/20 px-5 py-4 space-y-3 flex-shrink-0">
                {/* Table Number */}
                <div>
                  <label className="text-xs text-gold/50 uppercase tracking-wider block mb-1.5">Table Number</label>
                  <input
                    type="number" min={1} max={20}
                    placeholder="Enter your table number"
                    value={tableNumber}
                    onChange={e => { setTableNumber(e.target.value ? Number(e.target.value) : ''); setTableError(''); }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-accent placeholder-primary/30 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tableError ? 'rgba(239,68,68,0.5)' : 'rgba(201,166,91,0.2)'}` }}
                  />
                  {tableError && <p className="text-xs text-red-400 mt-1">{tableError}</p>}
                </div>

                {/* Special note */}
                <textarea
                  placeholder="Any special instructions? (optional)"
                  value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                  rows={2} className="w-full rounded-xl px-3 py-2 text-xs text-accent placeholder-primary/30 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,166,91,0.15)' }}
                />

                {/* Payment */}
                <div>
                  <p className="text-xs text-gold/50 mb-2 uppercase tracking-wider">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-xl py-2.5 text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)', color: '#000' }}>
                      💵 Cash on Delivery
                    </button>
                    {onlineEnabled ? (
                      <button className="rounded-xl py-2.5 text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(232,215,165,0.6)', border: '1px solid rgba(201,166,91,0.2)' }}>
                        💳 Pay Online
                      </button>
                    ) : (
                      <div className="relative rounded-xl py-2.5 text-xs font-semibold overflow-hidden cursor-not-allowed"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,166,91,0.1)' }}>
                        <span className="text-primary/20 flex items-center justify-center">💳 Pay Online</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', fontSize: '9px', letterSpacing: 1 }}>
                            COMING SOON
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary/70 text-sm">Total</span>
                  <span className="gold-text text-xl font-bold">₹{totalPrice}</span>
                </div>
                <button onClick={handlePlaceOrder} disabled={placing}
                  className="w-full rounded-full py-3.5 font-semibold text-sm transition hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)', color: '#000' }}>
                  {placing ? 'Placing Order...' : !user ? '🔐 Login to Order' : '🛒 Place Order (COD)'}
                </button>
                <button onClick={clearCart} className="w-full text-xs text-primary/40 hover:text-red-400 transition py-1">Clear Cart</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
