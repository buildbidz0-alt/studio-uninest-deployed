
import { notFound } from 'next/navigation';
import CybercafeDashboard from '@/components/vendor/dashboard/cybercafe-dashboard';
import FoodMessDashboard from '@/components/vendor/dashboard/food-mess-dashboard';
import HostelDashboard from '@/components/vendor/dashboard/hostel-dashboard';
import LibraryDashboard from '@/components/vendor/dashboard/library-dashboard';
import PageHeader from '@/components/admin/page-header';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

const categoryMap: { [key: string]: { label: string; component: React.FC<any> } } = {
    'library': { label: 'Library', component: LibraryDashboard },
    'food-mess': { label: 'Food Mess', component: FoodMessDashboard },
    'hostels': { label: 'Hostels', component: HostelDashboard },
    'cybercafe': { label: 'Cyber Café', component: CybercafeDashboard },
};

async function getVendorDataForCategory(categoryLabel: string, userId: string) {
    const supabase = createClient();

    let productCategories = [categoryLabel];
    if (categoryLabel === 'Hostels') {
        productCategories.push('Hostel Room');
    }

    const [productsRes, ordersRes] = await Promise.all([
        supabase
            .from('products')
            .select('*')
            .eq('seller_id', userId)
            .in('category', productCategories),
        supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                buyer_id,
                buyer:profiles!buyer_id(full_name, avatar_url),
                order_items:order_items!inner(
                    products:products!inner(name, category),
                    seat_number,
                    library_id,
                    product_id
                )
            `)
            .eq('vendor_id', userId)
            .in('order_items.products.category', productCategories)
            .order('created_at', { ascending: false })
    ]);

    if (productsRes.error || ordersRes.error) {
        console.error('Error fetching vendor data:', productsRes.error || ordersRes.error);
        return { products: [], orders: [] };
    }

    return {
        products: (productsRes.data as Product[]) || [],
        orders: (ordersRes.data as any[]) || [],
    };
}


export default async function VendorCategoryDashboardPage({ params }: { params: { category: string } }) {
    const categoryKey = params.category.replace('-', ' ');
    const categoryInfo = categoryMap[categoryKey];
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!categoryInfo || !user) {
        notFound();
    }
    
    const { products, orders } = await getVendorDataForCategory(categoryInfo.label, user.id);

    const DashboardComponent = categoryInfo.component;

    const props = {
        products,
        orders
    };

    return (
        <div>
            <DashboardComponent {...props} />
        </div>
    );
}
