
import type { Metadata } from 'next';
import VendorOrdersContent from '@/components/vendor/orders/page';
import VendorLayout from '../layout';

export const metadata: Metadata = {
  title: 'My Orders | Uninest',
  description: 'View and manage your customer orders.',
};

export default function VendorOrdersPage() {
    return (
        <VendorLayout>
            <VendorOrdersContent />
        </VendorLayout>
    )
}
