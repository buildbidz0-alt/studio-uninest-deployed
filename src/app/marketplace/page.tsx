
import { Suspense } from 'react';
import type { Metadata } from 'next';
import MarketplaceContent from '@/components/marketplace/marketplace-content';

export const metadata: Metadata = {
  title: 'Marketplace – Buy & Sell Textbooks, Hostel Needs, & More',
  description: 'Explore the UniNest marketplace to buy and sell textbooks, hostel needs, food mess subscriptions, clothes, and other products from fellow students.',
};

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  )
}
