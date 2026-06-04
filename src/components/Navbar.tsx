'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { navLinks } from '@/lib/data';

// Instagram SVG icon
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-ink/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-3">
          <span className="relative block h-10 w-10">
            <Image src="/logo.png" alt="Cool Cravings" fill sizes="40px" className="object-contain" />
          </span>
          <span className="gold-text text-lg font-semibold tracking-wide">
            Cool Cravings
          </span>
        </a>

        {/* Desktop nav links + Instagram */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link text-sm font-medium text-primary/90 transition hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
          {/* Instagram icon link */}
          <li>
            <a
              href="https://www.instagram.com/cool_.cravings/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-1.5 text-sm font-medium text-primary/90 transition hover:text-accent"
              title="Follow us on Instagram"
            >
              <InstagramIcon size={18} />
              <span className="hidden xl:inline">Instagram</span>
            </a>
          </li>
        </ul>

        <button
          aria-label="Toggle menu"
          className="lg:hidden text-2xl text-gold"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gold/20 bg-ink/95 backdrop-blur-xl">
          <ul className="flex flex-col gap-2 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-primary/90 hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {/* Instagram in mobile menu */}
            <li>
              <a
                href="https://www.instagram.com/cool_.cravings/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2 text-primary/90 hover:text-accent"
              >
                <InstagramIcon size={16} />
                Instagram
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
