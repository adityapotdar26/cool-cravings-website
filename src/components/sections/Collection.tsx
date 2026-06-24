'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import DrinkCard from './DrinkCard';
import DrinkModal from './DrinkModal';
import type { Drink } from '@/lib/data';

type Props = {
  collectionId: string;
  title: string;
  subtitle: string;
  theme: string;
};

export default function Collection({ collectionId, title, subtitle, theme }: Props) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [active, setActive] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDrinks = async () => {
    const { data } = await supabase
      .from('drinks')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('available', true)
      .order('position');

    if (data) {
      setDrinks(data.map((d) => ({
        name: d.name,
        image: d.image_url,
        description: d.description || '',
        ingredients: d.ingredients || [],
        taste: d.taste || '',
        serving: d.serving || '',
        benefits: d.benefits || [],
        price: d.price_regular,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrinks();

    // Real-time subscription — updates instantly when admin changes anything
    const channel = supabase
      .channel(`drinks-${collectionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drinks',
        filter: `collection_id=eq.${collectionId}`,
      }, () => fetchDrinks())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [collectionId]);

  if (loading || drinks.length === 0) return null;

  return (
    <section
      id={collectionId}
      className={`relative scroll-mt-20 bg-gradient-to-b ${theme} to-ink py-24`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="gold-text text-4xl font-bold sm:text-5xl">{title}</h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-gold/70">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {drinks.map((drink, i) => (
            <DrinkCard key={drink.name} drink={drink} index={i} onShowDetails={setActive} />
          ))}
        </div>
      </div>

      <DrinkModal drink={active} onClose={() => setActive(null)} />
    </section>
  );
}
