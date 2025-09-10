import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SeatSelectionClient = dynamic(
  () => import('@/components/booking/seat-selection-client'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Book a Seat | UniNest',
  description: 'Find and book your perfect study spot in the library or reading rooms.',
};

export default function BookingPage() {
  return <SeatSelectionClient />;
}
