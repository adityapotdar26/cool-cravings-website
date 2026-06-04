import Navbar from '@/components/Navbar';
import Hero from '@/components/hero/Hero';
import Collection from '@/components/sections/Collection';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import { collections } from '@/lib/data';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      {collections.map((collection) => (
        <Collection key={collection.id} collection={collection} />
      ))}
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
