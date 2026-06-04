'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DrinkCard from './DrinkCard';
import DrinkModal from './DrinkModal';
import type { Collection as CollectionType, Drink } from '@/lib/data';

export default function Collection({ collection }: { collection: CollectionType }) {
  const [active, setActive] = useState<Drink | null>(null);

  return (
    <section
      id={collection.id}
      className={`relative scroll-mt-20 bg-gradient-to-b ${collection.theme} to-ink py-24`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="gold-text text-4xl font-bold sm:text-5xl">{collection.title}</h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-gold/70">
            {collection.subtitle}
          </p>
        </motion.div>

        {/* Desktop: 4 columns | Mobile: 2 columns */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {collection.items.map((drink, i) => (
            <DrinkCard key={drink.name} drink={drink} index={i} onShowDetails={setActive} />
          ))}
        </div>
      </div>

      <DrinkModal drink={active} onClose={() => setActive(null)} />
    </section>
  );
}
