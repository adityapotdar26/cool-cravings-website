'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { navLinks } from '@/lib/data';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { user, logout, setAuthOpen, setAuthTab } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-ink/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3">
          <span className="relative block h-10 w-10">
            <Image src="/logo.png" alt="Cool Cravings" fill sizes="40px" className="object-contain" />
          </span>
          <span className="gold-text text-lg font-semibold tracking-wide">Cool Cravings</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav-link text-sm font-medium text-primary/90 transition hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="https://www.instagram.com/cool_.cravings/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-primary/90 transition hover:text-accent">
              <InstagramIcon size={18} />
              <span className="hidden xl:inline">Instagram</span>
            </a>
          </li>
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition"
            aria-label="Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black" style={{ background: 'linear-gradient(135deg, #C9A65B, #E8D7A5)' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* User button */}
          {user ? (
            <div className="relative group hidden lg:block">
              <button className="flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-sm text-gold hover:bg-gold/10 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {user.name.split(' ')[0]}
              </button>
              <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gold/20 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                style={{ background: 'linear-gradient(160deg, #1a0e00, #0d0700)' }}>
                <p className="px-4 py-1 text-xs text-primary/50">{user.phone}</p>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-sm text-gold hover:bg-gold/10 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Login
            </button>
          )}

          {/* Mobile hamburger */}
          <button aria-label="Toggle menu" className="lg:hidden text-2xl text-gold" onClick={() => setOpen((v) => !v)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gold/20 bg-ink/95 backdrop-blur-xl">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="block py-2 text-primary/90 hover:text-accent">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="https://www.instagram.com/cool_.cravings/" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-primary/90 hover:text-accent">
                <InstagramIcon size={16} /> Instagram
              </a>
            </li>
            <li className="border-t border-gold/10 pt-2 mt-1">
              {user ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gold text-sm">👤 {user.name}</span>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-xs text-red-400 border border-red-400/30 rounded-full px-3 py-1">
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthTab('login'); setAuthOpen(true); setOpen(false); }}
                  className="w-full text-left py-2 text-gold hover:text-accent text-sm"
                >
                  👤 Login / Sign Up
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
