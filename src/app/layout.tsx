import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import LoadingScreen from '@/components/providers/LoadingScreen';

export const metadata: Metadata = {
  title: 'Cool Cravings — Shakes & Drinks',
  description:
    'Cold Drinks, Shakes & Cold Coffee Served Ice Cold. A premium beverage lounge experience.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LoadingScreen />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
