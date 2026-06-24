# Cool Cravings — Shakes & Drinks

A premium, motion-graphics beverage lounge website. Built with **Next.js 15**,
TypeScript, Tailwind CSS, GSAP, Framer Motion, Three.js / React Three Fiber and
Lenis smooth scrolling.

## Features

- Cinematic 3D hero with an infinite brand-can carousel (Coca-Cola, Sprite,
  Pepsi, Fanta, Thums Up): slide in from left → hold at center → slide out right,
  with per-brand background gradients, ambient lighting, floating particles,
  ice cubes, a reflective floor and a subtle camera dolly / parallax.
- Sticky navbar with gold underline hover animation and a mobile menu.
- Collection sections (Shakes, Cold Coffee, Mojitos, Lassi, Buttermilk) using
  glassmorphism cards, scroll-triggered reveals, hover tilt/zoom and a
  "Show Details" modal (ingredients, taste profile, serving style, sizes,
  benefits, premium badge).
- About section with animated counters, Contact (phone, WhatsApp, hours, maps
  placeholder) and a footer.
- Premium logo loading screen and Lenis smooth scrolling.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Placeholders you must replace

These are referenced in code with `TODO` comments:

- **`public/logo.png`** — the Cool Cravings logo (used in navbar, footer and the
  loading screen). Rename/export your uploaded logo to this path.
- **`public/favicon.ico`** — favicon exported from the logo.
- **Contact details** in `src/components/sections/Contact.tsx` (phone, WhatsApp
  number, address, opening hours, Google Maps embed).
- **Social links** in `src/components/sections/Footer.tsx`.
- **Brand can art** (optional): cans are procedural geometry tinted with each
  brand's signature colour. To use licensed label textures, drop them in
  `public/cans/<brand>.png` and map them in `src/components/hero/CanModel.tsx`.

## Notes on brand assets

Real 3D can models / brand logos are **not** bundled. The hero renders
procedural cans tinted per brand. Ensure you have the rights to use any
third-party brand artwork before adding real textures.

## Project structure

```
src/
  app/            # layout, page, global styles
  components/
    hero/         # 3D canvas, can model, particles, ice, camera rig
    providers/    # Lenis smooth scroll, loading screen
    sections/     # collections, cards, modal, about, contact, footer
  lib/            # data (drinks, nav links) and brand themes
```
