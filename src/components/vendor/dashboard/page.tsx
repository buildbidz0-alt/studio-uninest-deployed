

'use client';

import { useEffect, useState, useMemo } from 'react';
import StatsCard from '@/components/vendor/stats-card';
import SalesChart from '@/components/vendor/sales-chart';
import RecentOrdersTable from '@/components/vendor/recent-orders-table';
import { DollarSign, ShoppingCart, Users, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/types';
import { subDays, format, startOfDay } from 'date-fns';
import LibraryDashboard from './library-dashboard';
import PageHeader from '@/components/admin/page-header';
import FoodMessDashboard from './food-mess-dashboard';
import HostelDashboard from './hostel-dashboard';
import CybercafeDashboard from './cybercafe-dashboard';


export default function VendorDashboardContent() {
  const { user, supabase, vendorCategories } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            products ( name )
          ),
          buyer:profiles!buyer_id (
            id, full_name, avatar_url
          )
        `)
        .eq('vendor_id', user.id);
      
      if (error) {
        console.error("Error fetching vendor data:", error);
      } else {
        setOrders(data as unknown as Order[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);
  
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.buyer_id)).size;
    return { revenue: totalRevenue, orders: totalOrders, customers: uniqueCustomers };
  }, [orders]);

  const salesData = useMemo(() => {
    const last7Days: { name: string, total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      last7Days.push({ name: format(date, 'MMM d'), total: 0 });
    }

    orders.forEach(order => {
      const orderDate = format(new Date(order.created_at), 'MMM d');
      const day = last7Days.find(d => d.name === orderDate);
      if (day) {
        day.total += order.total_amount;
      }
    });

    return last7Days;
  }, [orders]);

  const recentOrders = useMemo(() => {
      return orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const hasGeneralProductFeatures = useMemo(() => 
    vendorCategories.some(cat => !['library', 'food mess', 'hostels', 'cybercafe'].includes(cat))
  , [vendorCategories]);


  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={`Welcome, ${user?.user_metadata?.full_name || 'Vendor'}. Here's what's happening.`} />

      {/* Render dashboards based on vendor category */}
      <div className="space-y-8">
        {vendorCategories.includes('library') && <LibraryDashboard />}
        {vendorCategories.includes('food mess') && <FoodMessDashboard />}
        {vendorCategories.includes('hostels') && <HostelDashboard />}
        {vendorCategories.includes('cybercafe') && <CybercafeDashboard />}
      </div>

      {/* General Product Sales Dashboard */}
      {hasGeneralProductFeatures && (
         <div className="space-y-8 pt-8 border-t">
            <h2 className="text-2xl font-bold tracking-tight">General Sales Overview</h2>
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard 
                    title="Product Revenue" 
                    value={formatCurrency(stats.revenue)} 
                    icon={DollarSign} 
                    change={loading ? 'Loading...' : `${stats.orders} sales`} 
                />
                <StatsCard 
                    title="Product Orders" 
                    value={stats.orders.toString()} 
                    icon={ShoppingCart} 
                    change={loading ? 'Loading...' : `from ${stats.customers} customers`} 
                />
                 <StatsCard 
                    title="Unique Customers" 
                    value={stats.customers.toString()} 
                    icon={Users} 
                    change={loading ? 'Loading...' : 'have made purchases'} 
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                <SalesChart data={salesData} loading={loading} />
                </div>
                <div className="lg:col-span-2">
                <RecentOrdersTable orders={recentOrders} loading={loading} />
                </div>
            </div>
         </div>
      )}
    </div>
  );
}
