'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const brands = [
  { name: 'Coca-Cola',  image: '/Cocacola.png',  bg1: '#2a0006', bg2: '#7a0a18', particle: '#ff5a5a' },
  { name: 'Sprite',     image: '/Sprite.png',    bg1: '#06301c', bg2: '#0f7a45', particle: '#9cff7a' },
  { name: 'Pepsi',      image: '/Pepsi.png',     bg1: '#031535', bg2: '#0a3a8a', particle: '#5ab7ff' },
  { name: 'Fanta',      image: '/Fanta.png',     bg1: '#3a1c00', bg2: '#a85200', particle: '#ffb24d' },
  { name: 'Thums Up',   image: '/Thumsup.png',   bg1: '#000000', bg2: '#031a33', particle: '#3ea6ff' },
];

type Particle = {
  id: number;
  size: number;
  left: number;
  bottom: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
};

function makeParticles(color: string): Particle[] {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 6,
    left: Math.random() * 100,
    bottom: Math.random() * 40,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.5,
    color,
  }));
}

export default function HeroCanvas() {
  const [current, setCurrent] = useState(0);
  const [labelVisible, setLabelVisible] = useState(true);
  // Start with empty particles — populated client-side only to avoid hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const brand = brands[current];

  // Generate initial particles only on the client
  useEffect(() => {
    setParticles(makeParticles(brands[0].particle));
  }, []);

  const switchBrand = useCallback((idx: number) => {
    setCurrent(idx);
    setLabelVisible(false);
    setParticles(makeParticles(brands[idx].particle));
    setTimeout(() => setLabelVisible(true), 300);
  }, []);

  // Auto-cycle every 3.5s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % brands.length;
        setLabelVisible(false);
        setParticles(makeParticles(brands[next].particle));
        setTimeout(() => setLabelVisible(true), 300);
        return next;
      });
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes particleRise { 0%{transform:translateY(0) scale(1);opacity:0.8} 100%{transform:translateY(-600px) scale(0.3);opacity:0} }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 70% 50%, ${brand.bg2}, ${brand.bg1} 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      {/* Rising particles — client-only, no hydration warning */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              opacity: p.opacity,
              animation: `particleRise ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* DESKTOP: logo centred between text and can */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{ left: '36%', top: '50%', transform: 'translateY(-50%)', width: 270, height: 390 }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', filter: 'drop-shadow(0 0 40px rgba(201,166,91,0.25))' }}>
          <Image src="/logo-hero.png" alt="Cool Cravings" fill priority sizes="270px" className="object-contain" />
        </div>
      </div>

      {/* MOBILE: logo top-left */}
      <div
        className="absolute pointer-events-none block lg:hidden"
        style={{ left: 16, top: 90, width: 150, height: 190 }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', filter: 'drop-shadow(0 0 20px rgba(201,166,91,0.25))' }}>
          <Image src="/logo-hero.png" alt="Cool Cravings" fill priority sizes="150px" className="object-contain" />
        </div>
      </div>

      {/* DESKTOP: can image right side */}
      <div
        className="absolute hidden lg:block"
        style={{ right: 60, top: 76, bottom: 80, width: 420 }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', animation: 'heroFloat 3s ease-in-out infinite' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', filter: 'drop-shadow(0 30px 80px rgba(0,0,0,0.8))' }}>
            <Image src={brand.image} alt={brand.name} fill priority sizes="420px" className="object-contain" />
          </div>
        </div>
      </div>

      {/* MOBILE: can image top-right */}
      <div
        className="absolute block lg:hidden"
        style={{ right: 8, top: 76, width: '52vw', maxWidth: 220, height: 260 }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', animation: 'heroFloat 3s ease-in-out infinite' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))' }}>
            <Image src={brand.image} alt={brand.name} fill priority sizes="220px" className="object-contain" />
          </div>
        </div>
      </div>

      {/* Brand label bottom right */}
      <div
        style={{
          position: 'absolute', bottom: 32, right: 40,
          fontSize: 20, fontWeight: 700, letterSpacing: 4,
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)',
          textShadow: '0 0 18px rgba(255,255,255,0.4)',
          opacity: labelVisible ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        {brand.name}
      </div>

      {/* Dots navigation */}
      <div
        style={{
          position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, zIndex: 20,
        }}
      >
        {brands.map((b, i) => (
          <button
            key={b.name}
            onClick={() => switchBrand(i)}
            style={{
              width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: i === current ? '#C9A65B' : 'rgba(255,255,255,0.3)',
              transform: i === current ? 'scale(1.3)' : 'scale(1)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </>
  );
}
