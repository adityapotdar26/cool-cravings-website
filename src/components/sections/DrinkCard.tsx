'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Drink } from '@/lib/data';

export default function DrinkCard({
  drink,
  index,
  onShowDetails,
}: {
  drink: Drink;
  index: number;
  onShowDetails: (d: Drink) => void;
}) {
  return (
    <motion.div
      className="glass-card group overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Image: slightly shorter on mobile so card stays compact in 2-col */}
      <div className="relative h-36 w-full overflow-hidden sm:h-56">
        <Image
          src={drink.image}
          alt={drink.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent" />
      </div>
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-5">
        <h3 className="text-sm font-semibold text-accent sm:text-lg leading-tight">{drink.name}</h3>
        {/* Hide description on mobile to keep card tidy */}
        <p className="hidden sm:block text-sm text-primary/60">{drink.description}</p>
        <button
          onClick={() => onShowDetails(drink)}
          className="w-full rounded-full border border-gold/50 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gold transition hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(201,166,91,0.4)]"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
}
