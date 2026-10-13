import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

export const metadata: Metadata = {
  title: 'FoodSafe Global | Food Contamination Detection & Safety Management',
  description: 'Global food safety platform: search food contaminants, track official verified recalls, locate ISO 17025 accredited laboratories, and manage restaurant hygiene compliance logs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
