'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbTable, DbSession, DbOrder } from '@/lib/supabase';

type SubTab = 'live' | 'sessions' | 'history' | 'settings';

const TABLE_STATUS_COLORS = {
  available: '#10b981', occupied: '#f59e0b', preparing: '#3b82f6',
  serving: '#8b5cf6', billing: '#ef4444', completed: '#6b7280',
};
const TABLE_STATUS_LABELS = {
  available: 'Available', occupied: 'Occupied', preparing: 'Preparing',
  serving: 'Serving', billing: 'Billing', completed: 'Completed',
};

function elapsed(startedAt: string) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function TablesPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [subTab, setSubTab] = useState<SubTab>('live');
  const [tables, setTables] = useState<DbTable[]>([]);
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [histSessions, setHistSessions] = useState<DbSession[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [selectedTable, setSelectedTable] = useState<DbTable | null>(null);
  const [selectedSession, setSelectedSession] = useState<DbSession | null>(null);
  const [sessionOrders, setSessionOrders] = useState<DbOrder[]>([]);
  const [toast, setToast] = useState('');
  const [closeModal, setCloseModal] = useState<DbSession | null>(null);
  const [billModal, setBillModal] = useState<DbSession | null>(null);
  const [tick, setTick] = useState(0);

  // Table settings
  const [tableCount, setTableCount] = useState(10);
  const [tableCapacity, setTableCapacity] = useState(4);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleLogin = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
    if (data?.value === pwInput) { setLoggedIn(true); localStorage.setItem('cc_admin', 'true'); }
    else setPwError('Wrong password.');
  };

  useEffect(() => { if (localStorage.getItem('cc_admin') === 'true') setLoggedIn(true); }, []);

  // Tick for elapsed time
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const loadTables = useCallback(async () => {
    const { data } = await supabase.from('restaurant_tables').select('*').order('table_number');
    if (data) setTables(data as DbTable[]);
  }, []);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase.from('dining_sessions').select('*').in('status', ['active', 'billing']).order('started_at', { ascending: false });
    if (data) setSessions(data as DbSession[]);
  }, []);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from('dining_sessions').select('*').eq('status', 'completed').order('ended_at', { ascending: false }).limit(50);
    if (data) setHistSessions(data as DbSession[]);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setOrders(data as DbOrder[]);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    loadTables(); loadSessions(); loadHistory(); loadOrders();

    const channel = supabase.channel('tables-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, loadTables)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dining_sessions' }, () => { loadSessions(); loadHistory(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loggedIn, loadTables, loadSessions, loadHistory, loadOrders]);

  // Load session orders when session selected
  useEffect(() => {
    if (!selectedSession) return;
    const sessionOrds = orders.filter(o => (o as DbOrder & { session_id?: string }).session_id === selectedSession.id);
    setSessionOrders(sessionOrds);
  }, [selectedSession, orders]);

  const openTableDetail = (table: DbTable) => {
    setSelectedTable(table);
    const sess = sessions.find(s => s.table_number === table.table_number);
    setSelectedSession(sess || null);
  };

  const closeTable = async (session: DbSession) => {
    await supabase.from('dining_sessions').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', session.id);
    await supabase.from('restaurant_tables').update({ status: 'available' }).eq('table_number', session.table_number);
    await supabase.from('orders').update({ status: 'delivered' }).eq('session_id', session.id).in('status', ['pending', 'accepted', 'ready']);
    setCloseModal(null); setSelectedTable(null); setSelectedSession(null);
    showToast(`Table ${session.table_number} is now available`);
    await loadTables(); await loadSessions();
  };

  const markBilling = async (session: DbSession) => {
    await supabase.from('dining_sessions').update({ status: 'billing' }).eq('id', session.id);
    await supabase.from('restaurant_tables').update({ status: 'billing' }).eq('table_number', session.table_number);
    setBillModal(null);
    showToast(`Table ${session.table_number} marked for billing`);
    await loadTables(); await loadSessions();
  };

  const updateTableStatus = async (tableNum: number, status: DbTable['status']) => {
    await supabase.from('restaurant_tables').update({ status }).eq('table_number', tableNum);
    await loadTables();
    showToast(`Table ${tableNum} → ${status}`);
  };

  const addTable = async () => {
    const maxNum = Math.max(...tables.map(t => t.table_number), 0);
    await supabase.from('restaurant_tables').insert({ table_number: maxNum + 1, capacity: tableCapacity, status: 'available' });
    await loadTables(); showToast(`Table ${maxNum + 1} added`);
  };

  const deleteTable = async (id: string, num: number) => {
    if (!confirm(`Delete Table ${num}?`)) return;
    await supabase.from('restaurant_tables').delete().eq('id', id);
    await loadTables(); showToast(`Table ${num} deleted`);
  };

  // Styles (same as existing admin)
  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,166,91,0.15)', borderRadius: 12 };
  const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,166,91,0.2)', borderRadius: 8, padding: '8px 12px', color: '#E8D7A5', outline: 'none', fontSize: 13 } as React.CSSProperties;
  const goldBtn = { background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' } as React.CSSProperties;
  const outlineBtn = { background: 'transparent', border: '1px solid rgba(201,166,91,0.4)', borderRadius: 8, padding: '7px 14px', color: '#C9A65B', fontWeight: 500, fontSize: 12, cursor: 'pointer' } as React.CSSProperties;

  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d0700,#1a0e00)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...card, padding: 32, width: 320, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🍹</div>
        <h1 style={{ color: '#C9A65B', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Table Management</h1>
        <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 12, marginBottom: 24 }}>Cool Cravings Admin</p>
        <input type="password" placeholder="Admin password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...input, width: '100%', marginBottom: 12, textAlign: 'center' }} />
        {pwError && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{pwError}</p>}
        <button onClick={handleLogin} style={{ ...goldBtn, width: '100%', padding: '10px 16px' }}>Login</button>
        <a href="/admin" style={{ display: 'block', marginTop: 12, color: 'rgba(201,166,91,0.5)', fontSize: 12, textDecoration: 'none' }}>← Back to Main Dashboard</a>
      </div>
    </div>
  );

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'billing');
  const occupiedTables = tables.filter(t => t.status !== 'available');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d0700,#1a0e00)', color: '#E8D7A5', fontFamily: 'system-ui,sans-serif' }}>

      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: '#1a0e00', border: '1px solid rgba(201,166,91,0.4)', borderRadius: 10, padding: '10px 18px', color: '#C9A65B', fontWeight: 600, fontSize: 13 }}>{toast}</div>}

      {/* Close Table Modal */}
      {closeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...card, padding: 24, maxWidth: 380, width: '100%' }}>
            <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 8 }}>Close Table {closeModal.table_number}?</h3>
            <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 13, marginBottom: 8 }}>Session: {closeModal.session_code}</p>
            <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 13, marginBottom: 16 }}>Running Bill: <span style={{ color: '#C9A65B', fontWeight: 700 }}>₹{closeModal.total_amount}</span></p>
            <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12, marginBottom: 20 }}>This will end the session, clear all active orders and mark the table as available.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => closeTable(closeModal)} style={{ ...goldBtn, flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>Confirm Close</button>
              <button onClick={() => setCloseModal(null)} style={outlineBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {billModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...card, padding: 24, maxWidth: 380, width: '100%' }}>
            <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 8 }}>Generate Bill — Table {billModal.table_number}</h3>
            <p style={{ color: 'rgba(232,215,165,0.5)', fontSize: 13, marginBottom: 16 }}>Total Amount: <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 18 }}>₹{billModal.total_amount}</span></p>
            <div style={{ ...card, padding: 14, marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
              {orders.filter(o => (o as DbOrder & { session_id?: string }).session_id === billModal.id).map((o, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  {(o.items || []).map((item: { name: string; quantity: number; price: number }, j: number) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(232,215,165,0.7)', padding: '2px 0' }}>
                      <span>{item.name} ×{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#C9A65B', borderTop: '1px solid rgba(201,166,91,0.2)', paddingTop: 8, marginTop: 8 }}>
                <span>Total</span><span>₹{billModal.total_amount}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => markBilling(billModal)} style={{ ...goldBtn, flex: 1 }}>Mark for Billing</button>
              <button onClick={() => { closeTable(billModal); setBillModal(null); }} style={{ ...goldBtn, flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>Paid & Close</button>
            </div>
            <button onClick={() => setBillModal(null)} style={{ ...outlineBtn, width: '100%', marginTop: 8, textAlign: 'center' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Session Detail Panel */}
      {selectedTable && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }} onClick={() => { setSelectedTable(null); setSelectedSession(null); }}>
          <div style={{ ...card, width: '100%', maxWidth: 420, height: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderRadius: '16px 0 0 16px', borderRight: 'none' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(201,166,91,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d0700', zIndex: 1 }}>
              <div>
                <h3 style={{ color: '#C9A65B', fontWeight: 700, fontSize: 18 }}>Table {selectedTable.table_number}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: TABLE_STATUS_COLORS[selectedTable.status] + '22', color: TABLE_STATUS_COLORS[selectedTable.status] }}>
                  {TABLE_STATUS_LABELS[selectedTable.status]}
                </span>
              </div>
              <button onClick={() => { setSelectedTable(null); setSelectedSession(null); }} style={{ ...outlineBtn, padding: '6px 12px' }}>✕</button>
            </div>

            <div style={{ padding: 20, flex: 1 }}>
              {selectedSession ? (
                <>
                  <div style={{ ...card, padding: 14, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div><p style={{ fontSize: 10, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Session</p><p style={{ color: '#C9A65B', fontWeight: 700 }}>{selectedSession.session_code}</p></div>
                      <div><p style={{ fontSize: 10, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Elapsed</p><p style={{ color: '#E8D7A5', fontWeight: 600 }}>{elapsed(selectedSession.started_at)}</p></div>
                      <div><p style={{ fontSize: 10, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Customer</p><p style={{ color: '#E8D7A5' }}>{selectedSession.customer_name}</p></div>
                      <div><p style={{ fontSize: 10, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Phone</p><p style={{ color: '#E8D7A5' }}>{selectedSession.customer_phone}</p></div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Running Bill</p>
                  <div style={{ ...card, padding: 14, marginBottom: 16 }}>
                    {sessionOrders.length === 0 ? <p style={{ color: 'rgba(232,215,165,0.3)', fontSize: 13 }}>No orders yet</p> : (
                      <>
                        {sessionOrders.map((o, i) => (
                          <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(201,166,91,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(232,215,165,0.4)', marginBottom: 4 }}>
                              <span>Order #{o.id.slice(0, 6)} · {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span style={{ background: '#f59e0b22', color: '#f59e0b', borderRadius: 99, padding: '1px 6px', fontSize: 10 }}>{o.status}</span>
                            </div>
                            {(o.items || []).map((item: { name: string; quantity: number; price: number }, j: number) => (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(232,215,165,0.8)', padding: '1px 0' }}>
                                <span>{item.name} ×{item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#C9A65B', fontSize: 15, marginTop: 8 }}>
                          <span>Total</span><span>₹{selectedSession.total_amount}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status Control */}
                  <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Change Status</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {(['occupied', 'preparing', 'serving', 'billing'] as DbTable['status'][]).map(s => (
                      <button key={s} onClick={() => updateTableStatus(selectedTable.table_number, s)}
                        style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: selectedTable.status === s ? TABLE_STATUS_COLORS[s] : TABLE_STATUS_COLORS[s] + '22', color: selectedTable.status === s ? '#000' : TABLE_STATUS_COLORS[s] }}>
                        {TABLE_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => setBillModal(selectedSession)} style={goldBtn}>Generate Bill</button>
                    <button onClick={() => setCloseModal(selectedSession)} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', textAlign: 'center' }}>Close Table</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🪑</div>
                  <p style={{ color: '#10b981', fontWeight: 700 }}>Table Available</p>
                  <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 13, marginTop: 8 }}>No active session</p>
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)', marginBottom: 10 }}>Change status manually:</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {(['available', 'occupied'] as DbTable['status'][]).map(s => (
                        <button key={s} onClick={() => updateTableStatus(selectedTable.table_number, s)}
                          style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: TABLE_STATUS_COLORS[s] + '22', color: TABLE_STATUS_COLORS[s] }}>
                          {TABLE_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(201,166,91,0.15)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/admin" style={{ color: 'rgba(201,166,91,0.5)', textDecoration: 'none', fontSize: 13 }}>← Dashboard</a>
          <span style={{ color: 'rgba(201,166,91,0.3)' }}>|</span>
          <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 18 }}>🪑 Table Management</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)' }}>
            {occupiedTables.length}/{tables.length} occupied · {activeSessions.length} active sessions
          </span>
          <button onClick={() => { localStorage.removeItem('cc_admin'); setLoggedIn(false); }} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>Logout</button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid rgba(201,166,91,0.1)', overflowX: 'auto' }}>
        {([['live', 'Live Tables'], ['sessions', 'Active Sessions'], ['history', 'History'], ['settings', 'Settings']] as [SubTab, string][]).map(([t, l]) => (
          <button key={t} onClick={() => setSubTab(t)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', background: subTab === t ? 'linear-gradient(135deg,#C9A65B,#E8D7A5)' : 'rgba(255,255,255,0.04)', color: subTab === t ? '#000' : 'rgba(232,215,165,0.6)' }}>
            {l}{t === 'sessions' && activeSessions.length > 0 ? ` (${activeSessions.length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>

        {/* ── LIVE TABLES ── */}
        {subTab === 'live' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { l: 'Total Tables', v: tables.length, c: '#C9A65B' },
                { l: 'Available', v: tables.filter(t => t.status === 'available').length, c: '#10b981' },
                { l: 'Occupied', v: tables.filter(t => t.status === 'occupied').length, c: '#f59e0b' },
                { l: 'Active Sessions', v: activeSessions.length, c: '#3b82f6' },
                { l: "Today's Revenue", v: `₹${orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((s, o) => s + o.total_price, 0)}`, c: '#8b5cf6' },
              ].map(s => (
                <div key={s.l} style={{ ...card, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: s.c, fontSize: 20, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ color: 'rgba(232,215,165,0.5)', fontSize: 10, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Status legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              {Object.entries(TABLE_STATUS_LABELS).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: TABLE_STATUS_COLORS[k as DbTable['status']], flexShrink: 0 }} />
                  <span style={{ color: 'rgba(232,215,165,0.6)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Table Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {tables.map(table => {
                const session = sessions.find(s => s.table_number === table.table_number);
                const isActive = table.status !== 'available';
                return (
                  <div key={table.id} onClick={() => openTableDetail(table)}
                    style={{ ...card, padding: 16, cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s', border: `1px solid ${TABLE_STATUS_COLORS[table.status]}44`, background: isActive ? `${TABLE_STATUS_COLORS[table.status]}08` : 'rgba(255,255,255,0.02)' }}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.borderColor = TABLE_STATUS_COLORS[table.status]; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = TABLE_STATUS_COLORS[table.status] + '44'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 20 }}>T{table.table_number}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: TABLE_STATUS_COLORS[table.status] + '22', color: TABLE_STATUS_COLORS[table.status] }}>
                        {TABLE_STATUS_LABELS[table.status]}
                      </span>
                    </div>
                    {session ? (
                      <>
                        <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.5)', marginBottom: 2 }}>{session.customer_name}</p>
                        <p style={{ fontSize: 12, color: '#C9A65B', fontWeight: 700 }}>₹{session.total_amount}</p>
                        <p style={{ fontSize: 10, color: 'rgba(232,215,165,0.35)', marginTop: 4 }}>{elapsed(session.started_at)} · {tick >= 0 ? '' : ''}{session.session_code}</p>
                      </>
                    ) : (
                      <p style={{ fontSize: 11, color: 'rgba(232,215,165,0.3)', marginTop: 4 }}>Cap: {table.capacity} · Ready</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACTIVE SESSIONS ── */}
        {subTab === 'sessions' && (
          <div>
            {activeSessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(232,215,165,0.3)', padding: '60px 0' }}>No active dining sessions</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeSessions.map(sess => {
                  const sessOrders = orders.filter(o => (o as DbOrder & { session_id?: string }).session_id === sess.id);
                  return (
                    <div key={sess.id} style={{ ...card, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 16 }}>Table {sess.table_number}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sess.status === 'billing' ? '#ef444422' : '#10b98122', color: sess.status === 'billing' ? '#ef4444' : '#10b981' }}>{sess.status.toUpperCase()}</span>
                            <span style={{ color: 'rgba(232,215,165,0.5)', fontSize: 12 }}>{sess.session_code}</span>
                          </div>
                          <p style={{ color: 'rgba(232,215,165,0.7)', fontSize: 13, marginBottom: 4 }}>{sess.customer_name} · {sess.customer_phone}</p>
                          <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12 }}>Started: {new Date(sess.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · Elapsed: {elapsed(sess.started_at)}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                            {sessOrders.flatMap(o => o.items || []).map((item: { name: string; quantity: number }, j: number) => (
                              <span key={j} style={{ background: 'rgba(201,166,91,0.08)', border: '1px solid rgba(201,166,91,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
                                {item.name} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                          <span style={{ color: '#C9A65B', fontWeight: 700, fontSize: 18 }}>₹{sess.total_amount}</span>
                          <button onClick={() => setBillModal(sess)} style={goldBtn}>Generate Bill</button>
                          <button onClick={() => setCloseModal(sess)} style={{ ...outlineBtn, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>Close Table</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {subTab === 'history' && (
          <div>
            <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 16 }}>Completed Sessions</h3>
            {histSessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(232,215,165,0.3)', padding: '60px 0' }}>No completed sessions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {histSessions.map(sess => (
                  <div key={sess.id} style={{ ...card, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#C9A65B', fontWeight: 700 }}>Table {sess.table_number}</span>
                        <span style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12 }}>{sess.session_code}</span>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#6b728022', color: '#6b7280', fontWeight: 700 }}>COMPLETED</span>
                      </div>
                      <p style={{ color: 'rgba(232,215,165,0.6)', fontSize: 12 }}>{sess.customer_name} · {new Date(sess.started_at).toLocaleDateString('en-IN')}</p>
                      {sess.started_at && sess.ended_at && (
                        <p style={{ color: 'rgba(232,215,165,0.4)', fontSize: 11, marginTop: 2 }}>
                          Duration: {Math.round((new Date(sess.ended_at).getTime() - new Date(sess.started_at).getTime()) / 60000)} min
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#C9A65B', fontWeight: 700, fontSize: 16 }}>₹{sess.total_amount}</div>
                      <div style={{ fontSize: 11, color: 'rgba(232,215,165,0.4)' }}>{new Date(sess.ended_at || sess.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {subTab === 'settings' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ ...card, padding: 24, marginBottom: 16 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 16 }}>Table Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(232,215,165,0.5)', display: 'block', marginBottom: 4 }}>Default Capacity for New Tables</label>
                  <input type="number" min={1} max={20} value={tableCapacity} onChange={e => setTableCapacity(+e.target.value)} style={{ ...input, width: 120 }} />
                </div>
                <button onClick={addTable} style={{ ...goldBtn, alignSelf: 'flex-start' }}>+ Add New Table</button>
              </div>
            </div>

            <div style={{ ...card, padding: 24 }}>
              <h3 style={{ color: '#C9A65B', fontWeight: 700, marginBottom: 16 }}>Manage Tables</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tables.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,166,91,0.1)' }}>
                    <div>
                      <span style={{ color: '#E8D7A5', fontWeight: 600 }}>Table {t.table_number}</span>
                      <span style={{ color: 'rgba(232,215,165,0.4)', fontSize: 12, marginLeft: 10 }}>Cap: {t.capacity}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: TABLE_STATUS_COLORS[t.status] + '22', color: TABLE_STATUS_COLORS[t.status] }}>{TABLE_STATUS_LABELS[t.status]}</span>
                      {t.status === 'available' && <button onClick={() => deleteTable(t.id, t.table_number)} style={{ ...outlineBtn, padding: '4px 10px', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 11 }}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
