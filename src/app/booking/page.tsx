
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Book a Seat | UniNest',
  description: 'Find and book your perfect study spot in the library or reading rooms.',
};

export default function BookingPage() {
  // This page is now deprecated in favor of library-specific booking pages.
  // We redirect to the marketplace where users can discover libraries.
  redirect('/marketplace?category=Library');
}
