import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clean Canvas | Ready for Next Project',
  description: 'Built with Next.js 15, React 19, and Tailwind CSS on Cloudflare Pages.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
