
import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';

export const metadata: Metadata = {
  title: 'UniNest: 10,000+ Students Strong & Growing',
  description: 'Join the fastest-growing student platform. Connect, study, and thrive with over 10,000 of your peers on UniNest.',
};

export default function HomePage() {
  return <HomeClient />;
}
