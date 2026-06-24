'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbOrder, DbDrink, DbCollection } from '@/lib/supabase';

type Tab = 'orders' | 'menu' | 'analytics' | 'settings';
type OrderStatus = 'pending' | 'accepted' | 'ready' | 'delivered' | 'rejected';

const STATUS_COLORS: Record<OrderStatus, string> = { pending: '#f59e0b', accepted: '#3b82f6', ready: '#10b981', delivered: '#6b7280', rejected: '#ef4444' };
const STATUS_LABELS: Record<OrderStatus, string> = { pending: '🔔 Pending', accepted: '✅ Accepted', ready: '🚀 Ready', delivered: '✓ Delivered', rejected: '✕ Rejected' };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const emptyDrink = { name: '', image_url: '', description: '', taste: '', serving: '', ingredients: '', benefits: '', price: 60, available: true, collection_id: 'shakes' };

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [tab, setTab] = useState<Tab>('orders');

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [drinks, setDrinks] = useState<DbDrink[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('pending');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [selectedCollection, setSelectedCollection] = useState('shakes');
  const [drinkForm, setDrinkForm] = useState(emptyDrink);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newColForm, setNewColForm] = useState({ id: '', title: '', subtitle: '', theme: 'from-amber-900/30' });
  const [showColForm, setShowColForm] = useState(false);

  const [settings, setSettings] = useState({
    admin_password: '', whatsapp: '917058197979', shop_open: 'true',
    open_time: '11:00', close_time: '23:00', open_days: '1,2,3,4,5,6,0',
    store_timing_mode: 'auto', razorpay_key_id: '',
    online_payment_enabled: 'false',
  });
  const [newPw, setNewPw] = useState('');
  const [toast, setToast] = useState('');
  const [acceptModal, setAcceptModal] = useState<{ orderId: string; action: 'accept' | 'reject' } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const prevOrderCountRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Play beep on new order
  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  // Browser notification
  const sendBrowserNotif = useCallback((order: DbOrder) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('🔔 New Order — Cool Cravings', {
        body: `${order.customer_name} · ₹${order.total_price} · ${(order.items || []).length} item(s)`,
        icon: '/logo.png',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const handleLogin = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
    if (data?.value === pwInput) {
      setLoggedIn(true);
      localStorage.setItem('cc_admin', 'true');
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    } else setPwError('Wrong password.');
  };

  useEffect(() => { if (localStorage.getItem('cc_admin') === 'true') setLoggedIn(true); }, []);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) {
      const newPending = (data as DbOrder[]).filter(o => o.status === 'pending').length;
      if (newPending > prevOrderCountRef.current && prevOrderCountRef.current >= 0) {
        const newestOrder = (data as DbOrder[])[0];
        if (newestOrder && newestOrder.status === 'pending') {
          playBeep();
          sendBrowserNotif(newestOrder);
          showToast(`🔔 New order from ${newestOrder.customer_name}!`);
        }
      }
      prevOrderCountRef.current = newPending;
      setOrders(data as DbOrder[]);
    }
  }, [playBeep, sendBrowserNotif]);

  const loadMenu = useCallback(async () => {
    const { data: cols } = await supabase.from('collections').select('*').order('position');
    const { data: drks } = await supabase.from('drinks').select('*').order('position');
    if (cols) setCollections(cols as DbCollection[]);
    if (drks) setDrinks(drks as DbDrink[]);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const s: Record<string, string> = {};
      data.forEach((r: { key: string; value: string }) => { s[r.key] = r.value; });
      setSettings({
        admin_password: s.admin_password || '',
        whatsapp: s.whatsapp || '917058197979',
        shop_open: s.shop_open || 'true',
        open_time: s.open_time || '11:00',
        close_time: s.close_time || '23:00',
        open_days: s.open_days || '1,2,3,4,5,6,0',
        store_timing_mode: s.store_timing_mode || 'auto',
        razorpay_key_id: s.razorpay_key_id || '',
        online_payment_enabled: s.online_payment_enabled || 'false',
      });
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    loadOrders(); loadMenu(); loadSettings();
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => loadOrders())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loggedIn, loadOrders, loadMenu, loadSettings]);

  const updateOrder = async (id: string, status: OrderStatus, note?: string) => {
    const update: Record<string, unknown> = { status };
    if (note) update.admin_note = note;
    await supabase.from('orders').update(update).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...(note ? { admin_note: note } : {}) } : o));
    showToast(`Order marked as ${status}`);
    setAcceptModal(null); setActionNote('');
  };

  const handleActionConfirm = () => {
    if (!acceptModal) return;
    const status: OrderStatus = acceptModal.action === 'accept' ? 'accepted' : 'rejected';
    updateOrder(acceptModal.orderId, status, actionNote);
  };

  // WhatsApp customer
  const whatsappCustomer = (order: DbOrder, msg: string) => {
    const phone = order.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Drink CRUD
  const saveDrink = async () => {
    setSaving(true);
    const payload = { collection_id: drinkForm.collection_id, name: drinkForm.name, image_url: drinkForm.image_url || '/placeholder.jpg', description: drinkForm.description, taste: drinkForm.taste, serving: drinkForm.serving, ingredients: drinkForm.ingredients.split(',').map(s => s.trim()).filter(Boolean), benefits: drinkForm.benefits.split(',').map(s => s.trim()).filter(Boolean), price_regular: Number(drinkForm.price), price_large: Number(drinkForm.price), price_premium: Number(drinkForm.price), available: drinkForm.available };
    if (editingId) { await supabase.from('drinks').update(payload).eq('id', editingId); showToast('✅ Drink updated!'); }
    else { await supabase.from('drinks').insert(payload); showToast('✅ Drink added!'); }
    await loadMenu(); setDrinkForm(emptyDrink); setEditingId(null); setShowDrinkForm(false); setSaving(false);
  };

  const editDrink = (d: DbDrink) => { setDrinkForm({ name: d.name, image_url: d.image_url, description: d.description, taste: d.taste, serving: d.serving, ingredients: (d.ingredients || []).join(', '), benefits: (d.benefits || []).join(', '), price: d.price_regular, available: d.available, collection_id: d.collection_id }); setEditingId(d.id); setShowDrinkForm(true); };
  const deleteDrink = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('drinks').delete().eq('id', id); await loadMenu(); showToast('🗑 Deleted'); };
  const toggleAvailable = async (id: string, cur: boolean) => { await supabase.from('drinks').update({ available: !cur }).eq('id', id); setDrinks(prev => prev.map(d => d.id === id ? { ...d, available: !cur } : d)); showToast(!cur ? '✅ Live' : '🚫 Hidden'); };
  const saveCollection = async () => { if (!newColForm.id || !newColForm.title) { showToast('Fill ID and Title'); return; } await supabase.from('collections').insert({ id: newColForm.id.toLowerCase().replace(/\s+/g, '-'), title: newColForm.title, subtitle: newColForm.subtitle, theme: newColForm.theme, position: collections.length + 1 }); await loadMenu(); setNewColForm({ id: '', title: '', subtitle: '', theme: 'from-amber-900/30' }); setShowColForm(false); showToast('✅ Collection added!'); };
  const deleteCollection = async (id: string) => { if (!confirm('Delete collection and all drinks?')) return; await supabase.from('collections').delete().eq('id', id); await loadMenu(); showToast('🗑 Deleted'); };

  // Toggle day in open_days
  const toggleDay = (day: number) => {
    const days = settings.open_days.split(',').map(Number).filter(d => !isNaN(d));
    const updated = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
    setSettings(s => ({ ...s, open_days: updated.join(',') }));
  };

  const saveSettings = async () => {
    const updates = [
      { key: 'whatsapp', value: settings.whatsapp },
      { key: 'shop_open', value: settings.shop_open },
      { key: 'open_time', value: settings.open_time },
      { key: 'close_time', value: settings.close_time },
      { key: 'open_days', value: settings.open_days },
      { key: 'store_timing_mode', value: settings.store_timing_mode },
      { key: 'razorpay_key_id', value: settings.razorpay_key_id },
      { key: 'online_payment_enabled', value: settings.online_payment_enabled },
    ];
    if (newPw) updates.push({ key: 'admin_password', value: newPw });
    for (const u of updates) await supabase.from('settings').update({ value: u.value }).eq('key', u.key);
    showToast('✅ Settings saved!'); if (newPw) setNewPw('');
  };

  // Analytics
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_price, 0);
  const totalRevenue = orders.filter(o => o.status !== 'rejected').reduce((s, o) => s + o.total_price, 0);
  const onlineRevenue = orders.filter(o => (o as DbOrder & { payment_method?: string }).payment_method === 'online' && o.status !== 'rejected').reduce((s, o) => s + o.total_price, 0);
  const drinkCounts: Record<string, number> = {};
  orders.forEach(o => (o.items || []).forEach((i: { name: string; quantity: number }) => { drinkCounts[i.name] = (drinkCounts[i.name] || 0) + i.quantity; }));
  const topDrinks = Object.entries(drinkCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const collectionDrinks = drinks.filter(d => d.collection_id === selectedCollection);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Current store status
  const openDays = settings.open_days.split(',').map(Number).filter(d => !isNaN(d));
  const now = new Date();
  const [oh, om] = settings.open_time.split(':').map(Number);
  const [ch, cm] = settings.close_time.split(':').map(Number);
  const curMins = now.getHours() * 60 + now.getMinutes();
  const openMins = (oh || 0) * 60 + (om || 0);
  const closeMins = (ch || 0) * 60 + (cm || 0);
  const isStoreOpen = settings.store_timing_mode === 'open' ? true : settings.store_timing_mode === 'closed' ? false : (openDays.includes(now.getDay()) && curMins >= openMins && curMins < closeMins);

  // Styles
  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,166,91,0.15)', borderRadius: 12 };
  const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,166,91,0.2)', borderRadius: 8, padding: '8px 12px', color: '#E8D7A5', width: '100%', outline: 'none', fontSize: 13 } as React.CSSProperties;
  const goldBtn = { background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' } as React.CSSProperties;
  const outlineBtn = { background: 'transparent', border: '1px solid rgba(201,166,91,0.4)', borderRadius: 8, padding: '7px 14px', color: '#C9A65B', fontWeight: 500, fontSize: 12, cursor: 'pointer' } as React.CSSProperties;

  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d0700,#1a0e00)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...card, padding: 32, width: 320, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🍹</div>
        <h1 style={{ color: '#C9A65B', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 12, marginBottom: 24 }}>Cool Cravings</p>
        <input type="password" placeholder="Enter admin password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...input, marginBottom: 12, textAlign: 'center' }} />
        {pwError && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{pwError}</p>}
        <button onClick={handleLogin} style={{ ...goldBtn, width: '100%', padding: '10px 16px' }}>Login</button>
        <p style={{ color: 'rgba(232,215,165,0.3)', fontSize: 11, marginTop: 16 }}>Default: coolcravings123</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d0700,#1a0e00)', color: '#E8D7A5', fontFamily: 'system-ui,sans-serif' }}>

      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: '#1a0e00', border: '1px solid rgba(201,166,91,0.4)', borderRadius: 10, padding: '10px 18px', color: '#C9A65B', fontWeight: 600, fontSize: 13, maxWidth: 280 }}>{toast}</div>}

      {/* Accept/Reject Modal */}
      {acceptModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...card, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 4, fontSize: 16 }}>{acceptModal.action === 'accept' ? '✅ Accept Order' : '✕ Reject Order'}</h3>
            <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 12, marginBottom: 16 }}>Send a message to the customer</p>
            <textarea placeholder={acceptModal.action === 'accept' ? 'e.g. Ready in 10 minutes! 🥤' : 'e.g. Sorry, item temporarily unavailable.'} value={actionNote} onChange={e => setActionNote(e.target.value)} rows={3} style={{ ...input, resize: 'none', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleActionConfirm} style={{ ...goldBtn, flex: 1, background: acceptModal.action === 'accept' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}>
                {acceptModal.action === 'accept' ? '✅ Confirm Accept' : '✕ Confirm Reject'}
              </button>
              <button onClick={() => { setAcceptModal(null); setActionNote(''); }} style={outlineBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(201,166,91,0.15)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 18 }}>🍹 Cool Cravings Admin</span>
          <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: isStoreOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isStoreOpen ? '#10b981' : '#ef4444' }}>
            {isStoreOpen ? '● Store Open' : '● Store Closed'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pendingCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{pendingCount} new</span>}
          <button onClick={() => { localStorage.removeItem('cc_admin'); setLoggedIn(false); }} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid rgba(201,166,91,0.1)', overflowX: 'auto' }}>
        {(['orders', 'menu', 'analytics', 'settings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', whiteSpace: 'nowrap', background: tab === t ? 'linear-gradient(135deg,#C9A65B,#E8D7A5)' : 'rgba(255,255,255,0.04)', color: tab === t ? '#000' : 'rgba(232,215,165,0.6)' }}>
            {t === 'orders' ? `Orders${pendingCount > 0 ? ` (${pendingCount})` : ''}` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tables Module Link */}
      <div style={{ padding: '8px 24px', background: 'rgba(201,166,91,0.04)', borderBottom: '1px solid rgba(201,166,91,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/admin/tables" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(201,166,91,0.08)', border: '1px solid rgba(201,166,91,0.2)', color: '#C9A65B', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }}>
          🪑 Table Management
        </a>
        <span style={{ color: 'rgba(232,215,165,0.3)', fontSize: 12 }}>Manage dining sessions, live tables and billing</span>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
              {[{ l: "Today", v: todayOrders.length, i: '📦' }, { l: "Today Revenue", v: `₹${todayRevenue}`, i: '💰' }, { l: 'All Orders', v: orders.length, i: '🧾' }, { l: 'Total Revenue', v: `₹${totalRevenue}`, i: '📈' }, { l: 'Online Revenue', v: `₹${onlineRevenue}`, i: '💳' }, { l: 'COD Revenue', v: `₹${totalRevenue - onlineRevenue}`, i: '💵' }].map(s => (
                <div key={s.l} style={{ ...card, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>{s.i}</div>
                  <div style={{ color: '#C9A65B', fontSize: 18, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ color: 'rgba(232,215,165,0.5)', fontSize: 10, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['all', 'pending', 'accepted', 'ready', 'delivered', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => setOrderFilter(f)} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: orderFilter === f ? '#C9A65B' : 'rgba(255,255,255,0.06)', color: orderFilter === f ? '#000' : 'rgba(232,215,165,0.6)' }}>
                  {f === 'all' ? `All (${orders.length})` : `${STATUS_LABELS[f as OrderStatus]} (${orders.filter(o => o.status === f).length})`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(232,215,165,0.3)', padding: '60px 0' }}>No orders here</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredOrders.map(order => {
                  const o = order as DbOrder & { admin_note?: string; special_note?: string; payment_method?: string; payment_status?: string };
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} style={{ ...card, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ color: '#C9A65B', fontWeight: 700 }}>{order.customer_name}</span>
                          <span style={{ color: 'rgba(232,215,165,0.5)', fontSize: 12 }}>📞 {order.customer_phone}</span>
                          <span style={{ background: STATUS_COLORS[order.status], color: '#000', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[order.status]}</span>
                          <span style={{ background: o.payment_method === 'online' ? 'rgba(59,130,246,0.15)' : 'rgba(201,166,91,0.1)', color: o.payment_method === 'online' ? '#60a5fa' : '#C9A65B', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                            {o.payment_method === 'online' ? '💳 Online' : '💵 COD'}
                          </span>
                          {(o as DbOrder & { table_number?: number }).table_number && (
                            <span style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                              🪑 Table {(o as DbOrder & { table_number?: number }).table_number}
                            </span>
                          )}
                          <span style={{ color: '#C9A65B', fontWeight: 700 }}>₹{order.total_price}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'rgba(232,215,165,0.4)', fontSize: 11 }}>{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={{ color: 'rgba(232,215,165,0.4)' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(201,166,91,0.1)' }}>
                          <div style={{ paddingTop: 14 }}>
                            <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Items Ordered</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                              {(order.items || []).map((item: { name: string; quantity: number; price: number }, i: number) => (
                                <span key={i} style={{ background: 'rgba(201,166,91,0.08)', border: '1px solid rgba(201,166,91,0.2)', borderRadius: 6, padding: '4px 12px', fontSize: 13 }}>
                                  {item.name} ×{item.quantity} — ₹{item.price * item.quantity}
                                </span>
                              ))}
                            </div>

                            {o.special_note && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: 'rgba(232,215,165,0.7)' }}><span style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)' }}>Customer note: </span>{o.special_note}</div>}
                            {o.admin_note && <div style={{ background: 'rgba(201,166,91,0.06)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#C9A65B' }}><span style={{ fontSize: 11, color: 'rgba(201,166,91,0.5)' }}>Your message: </span>{o.admin_note}</div>}
                            <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.3)', marginBottom: 14 }}>
                              #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleString('en-IN')}
                              {(o as DbOrder & { table_number?: number; session_id?: string }).table_number && (
                                <> · <a href="/admin/tables" style={{ color: '#8b5cf6', textDecoration: 'none' }}>View Table {(o as DbOrder & { table_number?: number }).table_number}</a></>
                              )}
                            </p>

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {order.status === 'pending' && <>
                                <button onClick={() => setAcceptModal({ orderId: order.id, action: 'accept' })} style={{ ...goldBtn, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>✅ Accept</button>
                                <button onClick={() => setAcceptModal({ orderId: order.id, action: 'reject' })} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>✕ Reject</button>
                              </>}
                              {order.status === 'accepted' && <button onClick={() => updateOrder(order.id, 'ready', 'Your order is ready for pickup! 🎉')} style={goldBtn}>🚀 Mark Ready</button>}
                              {order.status === 'ready' && <button onClick={() => updateOrder(order.id, 'delivered')} style={goldBtn}>✓ Delivered</button>}
                              {(order.status === 'accepted' || order.status === 'ready') && <button onClick={() => setAcceptModal({ orderId: order.id, action: 'reject' })} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Cancel</button>}
                              <button onClick={() => whatsappCustomer(order, order.status === 'accepted' ? `Hi ${order.customer_name}! Your order is being prepared 👨‍🍳` : order.status === 'ready' ? `Hi ${order.customer_name}! Your order is ready for pickup 🎉` : `Hi ${order.customer_name}! Update on your order.`)} style={{ ...outlineBtn, background: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.3)', color: '#25D366' }}>
                                💬 WhatsApp
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              {collections.map(c => (<button key={c.id} onClick={() => setSelectedCollection(c.id)} style={{ padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: selectedCollection === c.id ? 'linear-gradient(135deg,#C9A65B,#E8D7A5)' : 'rgba(255,255,255,0.06)', color: selectedCollection === c.id ? '#000' : 'rgba(232,215,165,0.7)' }}>{c.title.split(' ')[0]}</button>))}
              <button onClick={() => setShowColForm(!showColForm)} style={{ ...outlineBtn, borderStyle: 'dashed' }}>+ New Collection</button>
            </div>
            {showColForm && (<div style={{ ...card, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}><input placeholder="ID (e.g. smoothies)" value={newColForm.id} onChange={e => setNewColForm({ ...newColForm, id: e.target.value })} style={input} /><input placeholder="Title" value={newColForm.title} onChange={e => setNewColForm({ ...newColForm, title: e.target.value })} style={input} /><input placeholder="Subtitle" value={newColForm.subtitle} onChange={e => setNewColForm({ ...newColForm, subtitle: e.target.value })} style={input} /><button onClick={saveCollection} style={goldBtn}>Add</button><button onClick={() => deleteCollection(selectedCollection)} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>Delete Selected</button></div>)}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, fontSize: 16 }}>{collections.find(c => c.id === selectedCollection)?.title} ({collectionDrinks.length})</h3>
              <button onClick={() => { setShowDrinkForm(!showDrinkForm); setEditingId(null); setDrinkForm({ ...emptyDrink, collection_id: selectedCollection }); }} style={goldBtn}>{showDrinkForm && !editingId ? '✕ Cancel' : '+ Add Drink'}</button>
            </div>
            {showDrinkForm && (
              <div style={{ ...card, padding: 20, marginBottom: 20 }}>
                <h4 style={{ color: '#C9A65B', marginBottom: 14, fontWeight: 600 }}>{editingId ? '✏️ Edit Drink' : '➕ New Drink'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Name *</label><input value={drinkForm.name} onChange={e => setDrinkForm({ ...drinkForm, name: e.target.value })} style={input} placeholder="Mango Shake" /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Image URL</label><input value={drinkForm.image_url} onChange={e => setDrinkForm({ ...drinkForm, image_url: e.target.value })} style={input} placeholder="/file.jpg or https://..." /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Description</label><input value={drinkForm.description} onChange={e => setDrinkForm({ ...drinkForm, description: e.target.value })} style={input} placeholder="A refreshing drink..." /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Taste</label><input value={drinkForm.taste} onChange={e => setDrinkForm({ ...drinkForm, taste: e.target.value })} style={input} placeholder="Sweet & fruity" /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Serving Style</label><input value={drinkForm.serving} onChange={e => setDrinkForm({ ...drinkForm, serving: e.target.value })} style={input} placeholder="Tall glass with ice" /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Ingredients (comma separated)</label><input value={drinkForm.ingredients} onChange={e => setDrinkForm({ ...drinkForm, ingredients: e.target.value })} style={input} placeholder="Mango, Milk, Sugar" /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Benefits (comma separated)</label><input value={drinkForm.benefits} onChange={e => setDrinkForm({ ...drinkForm, benefits: e.target.value })} style={input} placeholder="Vitamin C, Cooling" /></div>
                  <div><label style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Price (₹)</label><input type="number" value={drinkForm.price} onChange={e => setDrinkForm({ ...drinkForm, price: +e.target.value })} style={input} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}><input type="checkbox" id="avail" checked={drinkForm.available} onChange={e => setDrinkForm({ ...drinkForm, available: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#C9A65B' }} /><label htmlFor="avail" style={{ fontSize: 13, color: '#E8D7A5' }}>Available to customers</label></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={saveDrink} disabled={saving} style={{ ...goldBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : editingId ? 'Update' : 'Add Drink'}</button>
                  <button onClick={() => { setShowDrinkForm(false); setEditingId(null); setDrinkForm(emptyDrink); }} style={outlineBtn}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
              {collectionDrinks.map(d => (
                <div key={d.id} style={{ ...card, padding: 14, opacity: d.available ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div><div style={{ fontWeight: 600, color: '#E8D7A5', fontSize: 14 }}>{d.name}</div><div style={{ fontSize: 13, color: '#C9A65B', fontWeight: 700, marginTop: 2 }}>₹{d.price_regular}</div></div>
                    <button onClick={() => toggleAvailable(d.id, d.available)} style={{ borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: d.available ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: d.available ? '#10b981' : '#ef4444' }}>{d.available ? '✓ Live' : '✕ Off'}</button>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(232,215,165,0.45)', marginBottom: 10 }}>{d.description}</div>
                  <div style={{ display: 'flex', gap: 8 }}><button onClick={() => editDrink(d)} style={{ ...outlineBtn, flex: 1 }}>✏️ Edit</button><button onClick={() => deleteDrink(d.id)} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>🗑</button></div>
                </div>
              ))}
              {collectionDrinks.length === 0 && <div style={{ color: 'rgba(232,215,165,0.3)', textAlign: 'center', padding: '40px 0', gridColumn: '1/-1' }}>No drinks yet.</div>}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              {[{ l: "Today's Orders", v: todayOrders.length, i: '📦' }, { l: "Today Revenue", v: `₹${todayRevenue}`, i: '💰' }, { l: 'Total Orders', v: orders.length, i: '🧾' }, { l: 'All Revenue', v: `₹${totalRevenue}`, i: '📈' }, { l: 'Online Revenue', v: `₹${onlineRevenue}`, i: '💳' }, { l: 'COD Revenue', v: `₹${totalRevenue - onlineRevenue}`, i: '💵' }, { l: 'Menu Items', v: drinks.length, i: '🍹' }, { l: 'Live Items', v: drinks.filter(d => d.available).length, i: '✅' }].map(s => (
                <div key={s.l} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{s.i}</span>
                  <div><div style={{ color: '#C9A65B', fontSize: 18, fontWeight: 700 }}>{s.v}</div><div style={{ color: 'rgba(232,215,165,0.5)', fontSize: 11 }}>{s.l}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ ...card, padding: 20 }}>
                <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 14 }}>🏆 Top Selling</h3>
                {topDrinks.length === 0 ? <p style={{ color: 'rgba(232,215,165,0.3)', fontSize: 13 }}>No orders yet</p> : topDrinks.map(([name, count], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: '#C9A65B', fontWeight: 700, width: 20 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: '#E8D7A5' }}>{name}</div><div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, marginTop: 4 }}><div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#C9A65B,#E8D7A5)', width: `${(count / (topDrinks[0]?.[1] || 1)) * 100}%` }} /></div></div>
                    <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 13 }}>{count}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: 20 }}>
                <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 14 }}>📊 Order Status</h3>
                {(['pending', 'accepted', 'ready', 'delivered', 'rejected'] as OrderStatus[]).map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: '#E8D7A5', textTransform: 'capitalize' }}>{s}</span>
                    <span style={{ fontWeight: 700, color: '#C9A65B' }}>{orders.filter(o => o.status === s).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 16 }}>

            {/* Store Timing */}
            <div style={{ ...card, padding: 24 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 4 }}>🕐 Store Timing</h3>
              <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12, marginBottom: 16 }}>
                Current status: <span style={{ color: isStoreOpen ? '#10b981' : '#ef4444', fontWeight: 600 }}>{isStoreOpen ? 'Open' : 'Closed'}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Mode toggle */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 8 }}>Store Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[{ v: 'auto', l: '🕐 Auto' }, { v: 'open', l: '🟢 Always Open' }, { v: 'closed', l: '🔴 Always Closed' }].map(m => (
                      <button key={m.v} onClick={() => setSettings(s => ({ ...s, store_timing_mode: m.v }))} style={{ padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: settings.store_timing_mode === m.v ? 'linear-gradient(135deg,#C9A65B,#E8D7A5)' : 'rgba(255,255,255,0.05)', color: settings.store_timing_mode === m.v ? '#000' : 'rgba(232,215,165,0.6)' }}>{m.l}</button>
                    ))}
                  </div>
                </div>
                {/* Time pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Opens At</label><input type="time" value={settings.open_time} onChange={e => setSettings(s => ({ ...s, open_time: e.target.value }))} style={{ ...input }} /></div>
                  <div><label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Closes At</label><input type="time" value={settings.close_time} onChange={e => setSettings(s => ({ ...s, close_time: e.target.value }))} style={{ ...input }} /></div>
                </div>
                {/* Day toggles */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 8 }}>Open Days</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {DAY_NAMES.map((name, i) => {
                      const active = settings.open_days.split(',').map(Number).includes(i);
                      return <button key={i} onClick={() => toggleDay(i)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: active ? 'linear-gradient(135deg,#C9A65B,#E8D7A5)' : 'rgba(255,255,255,0.05)', color: active ? '#000' : 'rgba(232,215,165,0.5)' }}>{name}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div style={{ ...card, padding: 24 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 16 }}>⚙️ General</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>WhatsApp Number</label><input value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} style={input} placeholder="917058197979" /></div>
                <div><label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>New Admin Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={input} placeholder="Leave blank to keep current" /></div>
              </div>
            </div>

            {/* Razorpay Settings */}
            <div style={{ ...card, padding: 24 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 4 }}>💳 Razorpay (Online Payment)</h3>
              <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12, marginBottom: 16 }}>Get keys from razorpay.com → Settings → API Keys</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Razorpay Key ID (public)</label><input value={settings.razorpay_key_id} onChange={e => setSettings(s => ({ ...s, razorpay_key_id: e.target.value }))} style={input} placeholder="rzp_test_xxxxxxxxxx" /></div>
                <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.3)' }}>⚠ Also add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file for payment to work.</p>
              {/* Online Payment Toggle */}
              <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(201,166,91,0.15)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, color: '#E8D7A5', fontWeight: 600 }}>Enable Online Payment</p>
                    <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)', marginTop: 2 }}>
                      {settings.online_payment_enabled === 'true' ? '✅ Live — customers can pay online' : '⏳ Coming Soon — only COD available'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, online_payment_enabled: s.online_payment_enabled === 'true' ? 'false' : 'true' }))}
                    style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', background: settings.online_payment_enabled === 'true' ? '#10b981' : 'rgba(255,255,255,0.1)', flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: 3, left: settings.online_payment_enabled === 'true' ? 26 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', display: 'block' }} />
                  </button>
                </div>
              </div>
              </div>
            </div>

            {/* Save button full width */}
            <div style={{ gridColumn: '1/-1' }}>
              <button onClick={saveSettings} style={{ ...goldBtn, padding: '12px 32px', fontSize: 14 }}>💾 Save All Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
