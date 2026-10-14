import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'NutriScan | Food Intelligence & Metabolic Health Tracker',
  description: 'Scan any barcode or search any food product worldwide. Decode hidden sugars, industrial additives, and metabolic insulin spikes tailored to your personal health goal.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NutriScan',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="antialiased min-h-screen text-slate-900 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
