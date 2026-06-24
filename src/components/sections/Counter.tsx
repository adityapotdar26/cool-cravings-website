'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export default function Counter({
  to,
  label,
  suffix = '+',
}: {
  to: number;
  label: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <div ref={ref} className="text-center">
      <p className="gold-text text-4xl font-extrabold sm:text-5xl">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-widest text-primary/60">{label}</p>
    </div>
  );
}
