'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import type { Drink } from '@/lib/data';

export default function DrinkCard({ drink, index, onShowDetails }: { drink: Drink; index: number; onShowDetails: (d: Drink) => void }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(drink);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      className="glass-card group overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden sm:h-56 flex-shrink-0">
        <Image
          src={drink.image}
          alt={drink.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent" />
        {/* Price badge */}
        <div className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg,#C9A65B,#E8D7A5)' }}>
          ₹{drink.price}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-2">
        <h3 className="text-sm font-semibold text-accent sm:text-base leading-tight">{drink.name}</h3>
        <p className="hidden sm:block text-xs text-primary/50 leading-relaxed line-clamp-2">{drink.description}</p>

        {/* Buttons */}
        <div className="flex gap-1.5 mt-auto pt-1">
          <button
            onClick={() => onShowDetails(drink)}
            className="flex-1 rounded-full border border-gold/40 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/10"
          >
            Details
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-full py-1.5 text-xs font-semibold transition hover:scale-105 active:scale-95"
            style={{
              background: added ? 'linear-gradient(135deg,#25D366,#128C7E)' : 'linear-gradient(135deg,#C9A65B,#E8D7A5)',
              color: '#000',
            }}
          >
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
