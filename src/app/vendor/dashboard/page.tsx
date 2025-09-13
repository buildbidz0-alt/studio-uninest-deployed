
import type { Metadata } from 'next';
import VendorDashboardContent from '@/components/vendor/dashboard/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Uninest',
  description: 'Manage your listings, orders, and payouts.',
};

export default async function VendorDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vendorCategories = user.user_metadata?.vendor_categories || [];

    return (
        <VendorDashboardContent 
            userName={user.user_metadata?.full_name || 'Vendor'}
            vendorCategories={vendorCategories} 
        />
    );
}
