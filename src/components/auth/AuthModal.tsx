'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthModal() {
  const { authOpen, setAuthOpen, authTab, setAuthTab, login, signup } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setName(''); setPhone(''); setPassword(''); setError(''); setSuccess(''); };

  const handleSubmit = () => {
    setError(''); setSuccess('');
    if (!phone || !password) { setError('Please fill all fields.'); return; }
    if (authTab === 'signup') {
      if (!name) { setError('Please enter your name.'); return; }
      if (phone.length < 10) { setError('Enter a valid phone number.'); return; }
      const ok = signup(name, phone, password);
      if (!ok) { setError('Phone number already registered. Please login.'); return; }
      setSuccess('Account created! Welcome 🎉');
      reset();
    } else {
      const ok = login(phone, password);
      if (!ok) { setError('Invalid phone or password.'); return; }
      reset();
    }
  };

  if (!authOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => { setAuthOpen(false); reset(); }}>
        <div
          className="relative w-full max-w-sm rounded-2xl p-6 space-y-5"
          style={{ background: 'linear-gradient(160deg, #1a0e00, #0d0700)', border: '1px solid rgba(201,166,91,0.25)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={() => { setAuthOpen(false); reset(); }} className="absolute top-4 right-4 text-gold/60 hover:text-gold text-xl transition">✕</button>

          {/* Logo area */}
          <div className="text-center">
            <p className="gold-text text-2xl font-bold">Cool Cravings</p>
            <p className="text-primary/50 text-xs mt-1">Shakes & Drinks</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-full border border-gold/20 overflow-hidden">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setAuthTab(tab); reset(); }}
                className="flex-1 py-2 text-sm font-semibold capitalize transition"
                style={{
                  background: authTab === tab ? 'linear-gradient(135deg, #C9A65B, #E8D7A5)' : 'transparent',
                  color: authTab === tab ? '#000' : 'rgba(232,215,165,0.6)',
                }}
              >
                {tab === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {authTab === 'signup' && (
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-accent placeholder-primary/30 outline-none focus:ring-1 focus:ring-gold/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,166,91,0.2)' }}
              />
            )}
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-accent placeholder-primary/30 outline-none focus:ring-1 focus:ring-gold/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,166,91,0.2)' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-xl px-4 py-3 text-sm text-accent placeholder-primary/30 outline-none focus:ring-1 focus:ring-gold/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,166,91,0.2)' }}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          {success && <p className="text-green-400 text-xs text-center">{success}</p>}

          <button
            onClick={handleSubmit}
            className="w-full rounded-full py-3 font-semibold text-sm transition hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #C9A65B, #E8D7A5)', color: '#000' }}
          >
            {authTab === 'login' ? 'Login' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-primary/40">
            {authTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setAuthTab(authTab === 'login' ? 'signup' : 'login'); reset(); }}
              className="text-gold hover:underline"
            >
              {authTab === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
