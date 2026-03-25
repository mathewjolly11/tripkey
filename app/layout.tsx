import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'TripKey - One QR for Your Entire Trip',
  description:
    'Unified digital identity that replaces multiple tickets with a single secure QR pass. Simplify your travel experience.',
  keywords:
    'TripKey, travel, QR code, ticket management, tourism, digital identity',
  authors: [{ name: 'TripKey Team' }],
  openGraph: {
    title: 'TripKey - One QR for Your Entire Trip',
    description: 'Simplify your travel with unified QR pass',
    url: 'https://tripkey.com',
    siteName: 'TripKey',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripKey - One QR for Your Entire Trip',
    description: 'Simplify your travel with unified QR pass',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0EA5E9" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
