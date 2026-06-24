'use client';

import { motion } from 'framer-motion';
import Counter from './Counter';

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="gold-text text-4xl font-bold sm:text-5xl"
        >
          About Cool Cravings
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-primary/70"
        >
          Our passion is serving premium shakes, refreshing drinks and handcrafted
          cold coffees made with quality ingredients.
        </motion.p>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <Counter to={12} label="Years of Service" />
          <Counter to={50000} label="Happy Customers" />
          <Counter to={200000} label="Drinks Served" />
        </div>
      </div>
    </section>
  );
}
