import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Radiorogue',
  description: 'Stay tuned with the latest things',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white max-w-7xl mx-auto`}>
        <Header />
        {/* Wrap Loader in Suspense */}
        <Suspense fallback={<div>Loading...</div>}>
          <Loader />
        </Suspense>
        <main className="flex-grow p-4">
          <div className="bg-white">
            {children}
          </div>
          <Analytics />
          <SpeedInsights />
        </main>
        <Footer />
      </body>
    </html>
  );
}