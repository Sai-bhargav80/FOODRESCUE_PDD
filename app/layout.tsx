import type { Metadata } from 'next';
import './app.css';
import '../styles/globals.css';
import { RootLayout } from '@/components/Layout';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FoodRescue — Rescue Food, Save Lives',
  description: 'Connect food donors with volunteers. Real-time rescue tracking, community impact rewards.',
  keywords: 'food rescue, food donation, volunteer, sustainability',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050914" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark-950 text-dark-100 antialiased">
        <Providers>
          <RootLayout>{children}</RootLayout>
        </Providers>
      </body>
    </html>
  );
}
