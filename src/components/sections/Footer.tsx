'use client';

import Image from 'next/image';
import { navLinks } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-ink py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            {/* TODO: replace /logo.png with the uploaded Cool Cravings logo. */}
            <span className="relative block h-10 w-10">
              <Image src="/logo.png" alt="Cool Cravings" fill sizes="40px" className="object-contain" />
            </span>
            <span className="gold-text text-lg font-semibold">Cool Cravings</span>
          </div>
          <p className="mt-4 text-sm text-primary/60">
            Cold Drinks, Shakes &amp; Cold Coffee Served Ice Cold.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Quick Links</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-primary/70 transition hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Follow Us</p>
          <div className="mt-4 flex gap-4 text-primary/70">
            {/* TODO: replace # with real social URLs */}
            <a href="https://www.instagram.com/cool_.cravings/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition hover:text-accent">Instagram</a>
            <a href="#" aria-label="Facebook" className="transition hover:text-accent">Facebook</a>
            <a href="#" aria-label="YouTube" className="transition hover:text-accent">YouTube</a>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-primary/40">
        © {new Date().getFullYear()} Cool Cravings. All rights reserved.
      </p>
    </footer>
  );
}
