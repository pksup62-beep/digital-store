import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Digital Store',
    default: 'Digital Store - Premium Courses & Assets',
  },
  description: 'Buy premium courses and digital assets with ease.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://digital-store.vercel.app', // Update with actual Vercel URL if known
    siteName: 'Digital Store',
    images: [
      {
        url: '/api/og', // We can add a default OG image generator later or use a static one
        width: 1200,
        height: 630,
        alt: 'Digital Store',
      },
    ],
  },
};

import Header from '@/components/Header';

import Providers from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
