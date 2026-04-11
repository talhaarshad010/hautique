import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hautique | Luxury Perfumes',
  description: 'Discover the finest scents at Hautique. Modern luxury perfumes for her and him.',
};

import { CartProvider } from '@/context/CartContext';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="font-sans antialiased bg-white text-black">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
