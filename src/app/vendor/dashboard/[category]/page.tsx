
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
    'cybercafe': { label: 'Cybercafe', component: CybercafeDashboard },
};

async function getVendorDataForCategory(categoryLabel: string, userId: string) {
    const supabase = createClient();

    let productCategories = [categoryLabel];
    if (categoryLabel === 'Hostels') {
        productCategories.push('Hostel Room');
    }

    const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .in('category', productCategories);

    if (productsError) {
        console.error('Error fetching products for vendor dashboard:', productsError);
        return { products: [], orders: [] };
    }
    
    const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            total_amount,
            status,
            buyer_id,
            buyer:profiles!buyer_id(full_name, avatar_url),
            order_items:order_items (
                seat_number,
                library_id,
                product_id,
                products ( name, category )
            )
        `)
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error('Error fetching orders for vendor dashboard:', ordersError);
        // Continue with products data even if orders fail
        return { products: (productsData as Product[]) || [], orders: [] };
    }

    const relevantOrders = (ordersData || []).filter(order =>
      order.order_items.some((item: any) =>
        item.products && productCategories.includes(item.products.category)
      )
    );

    return {
        products: (productsData as Product[]) || [],
        orders: (relevantOrders as any[]) || [],
    };
}


export default async function VendorCategoryDashboardPage({ params }: { params: { category: string } }) {
    const categoryKey = params.category;
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
