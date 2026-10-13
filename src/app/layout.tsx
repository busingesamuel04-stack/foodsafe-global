import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriScan | Food Intelligence & Metabolic Health Tracker',
  description: 'Scan any barcode or search any food product. Decode hidden sugars, industrial additives, and metabolic insulin spikes tailored to your personal health goal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="antialiased min-h-screen text-slate-900 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
