import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from '@/components/layout/main-layout';
import { AuthProvider } from '@/hooks/use-auth';
import ClientOnly from '@/components/client-only';

export const metadata: Metadata = {
  metadataBase: new URL('https://uninest.app'), // Replace with your actual domain
  title: {
    default: 'UniNest – The All-in-One Student Platform',
    template: '%s | UniNest',
  },
  description: 'UniNest is a one-stop platform for students to connect, share notes, join competitions, buy/sell textbooks, and explore campus life with ease.',
  keywords: ['student platform', 'UniNest', 'campus life', 'social feed', 'marketplace', 'competitions', 'internships'],
  authors: [{ name: 'UniNest Team' }],
  openGraph: {
    title: 'UniNest – The All-in-One Student Platform',
    description: 'Connect, share, and thrive with UniNest.',
    url: 'https://uninest.app',
    siteName: 'UniNest',
    images: [
      {
        url: '/images/uninest-og.png', // Path to your OG image in the public folder
        width: 1200,
        height: 630,
        alt: 'UniNest Platform Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniNest – The All-in-One Student Platform',
    description: 'The ultimate platform for modern students. Connect, learn, and grow.',
    images: ['/images/uninest-og.png'], // Path to your Twitter image in the public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <ClientOnly>
          <AuthProvider supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthProvider>
        </ClientOnly>
        <Toaster />
      </body>
    </html>
  );
}
