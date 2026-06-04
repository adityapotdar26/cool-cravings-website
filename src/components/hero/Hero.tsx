'use client';

import { motion } from 'framer-motion';
import HeroCanvas from './HeroCanvas';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* All background, particles, can image, dots rendered here */}
      <HeroCanvas />

      {/*
        ── DESKTOP layout ──
        Text sits on the left, logo & can are handled in HeroCanvas (absolute).
        flex items-center keeps the text vertically centred.
      */}
      <motion.div
        className="relative z-10 hidden lg:flex items-center"
        style={{ padding: '0 48px', maxWidth: 520, marginTop: 60 }}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <div>
          <h1
            style={{
              fontSize: 52, fontWeight: 800, lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFF5D6, #C9A65B, #E8D7A5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Chill.<br />Sip.<br />Refresh.
          </h1>
          <p style={{ color: 'rgba(232,215,165,0.8)', fontSize: 16, marginTop: 20, lineHeight: 1.6 }}>
            Cold Drinks, Shakes &amp; Cold Coffee Served Ice Cold.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            <a
              href="#shakes"
              style={{
                background: 'linear-gradient(135deg, #C9A65B, #E8D7A5)',
                color: '#000', fontWeight: 600, fontSize: 14,
                borderRadius: 999, padding: '12px 28px', textDecoration: 'none',
                transition: 'transform 0.2s', display: 'inline-block',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              View Menu
            </a>
            <a
              href="#contact"
              style={{
                background: 'transparent', color: '#E8D7A5', fontSize: 14, fontWeight: 600,
                border: '1px solid rgba(201,166,91,0.5)', borderRadius: 999,
                padding: '12px 28px', textDecoration: 'none', display: 'inline-block',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(201,166,91,0.1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              Order Now
            </a>
          </div>
        </div>
      </motion.div>

      {/*
        ── MOBILE layout ──
        Full-width column:
          Row 1: logo (left) + can (right) — handled by HeroCanvas (absolute),
                 so we just reserve height with a spacer div.
          Row 2: headline text
          Row 3: buttons (full-width pill style like the design)
      */}
      <motion.div
        className="relative z-10 flex lg:hidden flex-col justify-end w-full"
        style={{ minHeight: '100vh', paddingBottom: 60 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* Spacer — gives the absolutely-positioned logo+can their vertical room */}
        <div style={{ flex: '1 1 auto', minHeight: 300 }} />

        {/* Headline */}
        <div style={{ padding: '0 20px' }}>
          <h1
            style={{
              fontSize: 52, fontWeight: 800, lineHeight: 1.08,
              background: 'linear-gradient(135deg, #FFF5D6, #C9A65B, #E8D7A5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Chill.<br />Sip.<br />Refresh.
          </h1>
          <p style={{ color: 'rgba(232,215,165,0.8)', fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
            Cold Drinks, Shakes &amp; Cold Coffee Served Ice Cold.
          </p>
        </div>

        {/* Buttons — full width pill style */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href="#shakes"
            style={{
              background: 'linear-gradient(135deg, #C9A65B, #E8D7A5)',
              color: '#000', fontWeight: 600, fontSize: 15,
              borderRadius: 999, padding: '14px 20px', textDecoration: 'none',
              textAlign: 'center', display: 'block',
            }}
          >
            View Menu
          </a>
          <a
            href="#contact"
            style={{
              background: 'transparent', color: '#E8D7A5', fontSize: 15, fontWeight: 600,
              border: '1px solid rgba(201,166,91,0.5)', borderRadius: 999,
              padding: '14px 20px', textDecoration: 'none', textAlign: 'center',
              display: 'block',
            }}
          >
            Order Now
          </a>
        </div>
      </motion.div>
    </section>
  );
}
