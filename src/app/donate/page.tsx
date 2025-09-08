
import type { Metadata } from 'next';
import DonateContent from '@/components/donate/donate-content';

export const metadata: Metadata = {
  title: 'Support UniNest – Help Us Reach Our Monthly Goal',
  description: 'UniNest runs on community support. Every rupee counts. Donate now to help keep the platform running for students.',
};

export default function DonatePage() {
    return <DonateContent />
}
