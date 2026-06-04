'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import type { Drink } from '@/lib/data';

export default function DrinkModal({
  drink,
  onClose,
}: {
  drink: Drink | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {drink && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card relative w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 w-full">
              <Image src={drink.image} alt={drink.name} fill className="object-cover" />
              <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-gold to-primary px-3 py-1 text-xs font-bold text-ink">
                ★ Premium
              </span>
            </div>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-accent"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="space-y-4 p-6">
              <h3 className="gold-text text-2xl font-bold">{drink.name}</h3>
              <p className="text-sm text-primary/70">{drink.description}</p>

              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Ingredients</p>
                <p className="text-sm text-primary/90">{drink.ingredients.join(', ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold">Taste Profile</p>
                  <p className="text-sm text-primary/90">{drink.taste}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold">Serving Style</p>
                  <p className="text-sm text-primary/90">{drink.serving}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Available Sizes</p>
                <div className="mt-1 flex gap-2">
                  {drink.sizes.map((s) => (
                    <span key={s} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-primary/90">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {drink.benefits && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold">Benefits</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-primary/90">
                    {drink.benefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
