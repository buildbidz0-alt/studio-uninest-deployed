
import type { Metadata } from 'next';
import VendorDashboardContent from '@/components/vendor/dashboard/page';

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Uninest',
  description: 'Manage your listings, orders, and payouts.',
};

export default function VendorDashboardPage() {
  return <VendorDashboardContent />;
}

    
