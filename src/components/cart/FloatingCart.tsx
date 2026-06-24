'use client';

import { useCart } from '@/lib/CartContext';

export default function FloatingCart() {
  const { totalItems, setIsOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full shadow-2xl px-4 py-3 font-semibold text-black text-sm transition hover:scale-110 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #C9A65B, #E8D7A5)',
        boxShadow: '0 8px 30px rgba(201,166,91,0.5)',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {totalItems} item{totalItems > 1 ? 's' : ''} · View Cart
    </button>
  );
}
