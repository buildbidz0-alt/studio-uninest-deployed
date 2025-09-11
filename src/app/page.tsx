
import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';

export const metadata: Metadata = {
  title: 'UniNest – Connect & Simplify Campus Life',
  description: 'The All-in-One Platform for Students & Libraries. Unlock your full potential with our suite of academic tools, a vibrant marketplace, and powerful collaboration features designed for the modern student.',
};

export default function HomePage() {
  return <HomeClient />;
}
