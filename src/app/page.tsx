import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';

export const metadata: Metadata = {
  title: 'Home | UniNest',
  description: 'Your digital campus hub. Connect, share, and thrive with UniNest.',
};

export default function HomePage() {
  return <HomeClient />;
}
