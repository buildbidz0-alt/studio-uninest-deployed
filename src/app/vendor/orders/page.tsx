
import type { Metadata } from 'next';
import VendorOrdersContent from '@/components/vendor/orders/page';

export const metadata: Metadata = {
  title: 'My Orders | Uninest',
  description: 'View and manage your customer orders.',
};

export default function VendorOrdersPage() {
    return (
        <VendorOrdersContent />
    )
}
