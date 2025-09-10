import type { Metadata } from 'next';
import SeatSelectionClient from '@/components/booking/seat-selection-client';

export const metadata: Metadata = {
  title: 'Book a Seat | UniNest',
  description: 'Find and book your perfect study spot in the library or reading rooms.',
};

export default function BookingPage() {
  return <SeatSelectionClient />;
}
