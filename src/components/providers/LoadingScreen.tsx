'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2200);
    const hideTimer = setTimeout(() => setVisible(false), 3000);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes loadBar { from{width:0%} to{width:100%} }
      `}</style>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: '#000',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9A65B, #FFF5D6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#000',
            animation: 'logoPulse 1.5s ease-in-out infinite',
          }}
        >
          CC
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 24, width: 160, height: 2,
          background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #C9A65B, #FFF5D6)',
            animation: 'loadBar 2.2s ease-in-out forwards',
          }} />
        </div>

        {/* Text */}
        <p style={{
          marginTop: 14, fontSize: 11, letterSpacing: 4,
          color: 'rgba(201,166,91,0.8)', textTransform: 'uppercase',
        }}>
          Chill. Sip. Refresh.
        </p>
      </div>
    </>
  );
}
