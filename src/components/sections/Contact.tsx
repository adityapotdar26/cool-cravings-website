'use client';

import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="gold-text mb-12 text-center text-4xl font-bold sm:text-5xl"
        >
          Visit Us
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card glow-border space-y-5 p-8"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Phone</p>
              <a href="tel:+917058197979" className="text-lg text-accent">+91 70581 97979</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Address</p>
              <p className="text-primary/80">Food Court, Sanjay Ghodawat University, Atigre – 416118</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Opening Hours</p>
              <p className="text-primary/80">Mon – Sun · 11:00 AM – 11:00 PM</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/917058197979"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition hover:scale-105"
              >
                Chat on WhatsApp
              </a>
              <a
                href="https://www.instagram.com/cool_.cravings/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
                Instagram
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card glow-border flex min-h-[300px] flex-col overflow-hidden"
          >
            {/* Clickable map overlay linking to Google Maps */}
            <a
              href="https://maps.app.goo.gl/kQBLVRPp1drGrWX3A"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex-1 block"
              title="Open in Google Maps"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.0!2d74.5!3d16.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc0!2sSanjay+Ghodawat+University+Atigre!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="260"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cool Cravings Location"
              />
              {/* invisible overlay to make whole map clickable */}
              <span className="absolute inset-0" />
            </a>
            {/* Open in Maps button */}
            <a
              href="https://maps.app.goo.gl/kQBLVRPp1drGrWX3A"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-t border-gold/20 py-3 text-sm font-medium text-gold transition hover:bg-gold/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              Open in Google Maps
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
