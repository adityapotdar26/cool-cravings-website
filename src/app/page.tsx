'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/hero/Hero';
import Collection from '@/components/sections/Collection';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingCart from '@/components/cart/FloatingCart';
import AuthModal from '@/components/auth/AuthModal';

type DbCollection = {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  position: number;
};

export default function Home() {
  const [collections, setCollections] = useState<DbCollection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('position');
      if (data) setCollections(data as DbCollection[]);
    };

    fetchCollections();

    // Real-time — if admin adds/removes a collection it reflects instantly
    const channel = supabase
      .channel('collections-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collections',
      }, fetchCollections)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      {collections.map((col) => (
        <Collection
          key={col.id}
          collectionId={col.id}
          title={col.title}
          subtitle={col.subtitle}
          theme={col.theme}
        />
      ))}
      <About />
      <Contact />
      <Footer />
      <CartDrawer />
      <FloatingCart />
      <AuthModal />
    </main>
  );
}
