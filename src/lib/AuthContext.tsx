'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type User = {
  name: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  login: (phone: string, password: string) => boolean;
  signup: (name: string, phone: string, password: string) => boolean;
  logout: () => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  authTab: 'login' | 'signup';
  setAuthTab: (v: 'login' | 'signup') => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const signup = (name: string, phone: string, password: string): boolean => {
    try {
      const accounts = JSON.parse(localStorage.getItem('cc_accounts') || '[]');
      const exists = accounts.find((a: { phone: string }) => a.phone === phone);
      if (exists) return false; // already registered
      accounts.push({ name, phone, password });
      localStorage.setItem('cc_accounts', JSON.stringify(accounts));
      const u = { name, phone };
      localStorage.setItem('cc_user', JSON.stringify(u));
      setUser(u);
      setAuthOpen(false);
      return true;
    } catch { return false; }
  };

  const login = (phone: string, password: string): boolean => {
    try {
      const accounts = JSON.parse(localStorage.getItem('cc_accounts') || '[]');
      const account = accounts.find((a: { phone: string; password: string }) => a.phone === phone && a.password === password);
      if (!account) return false;
      const u = { name: account.name, phone: account.phone };
      localStorage.setItem('cc_user', JSON.stringify(u));
      setUser(u);
      setAuthOpen(false);
      return true;
    } catch { return false; }
  };

  const logout = () => {
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, authOpen, setAuthOpen, authTab, setAuthTab }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
