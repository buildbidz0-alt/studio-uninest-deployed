
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StatsCard from '@/components/vendor/stats-card';
import SalesChart from '@/components/vendor/sales-chart';
import RecentOrdersTable from '@/components/vendor/recent-orders-table';
import { DollarSign, ShoppingCart, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function VendorDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, productsSold: 0 });
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // This is a simplified example. In a real app, you would have tables for
      // orders, products, etc., and you'd query them with RLS policies.
      // For now, we'll use placeholder logic.

      // TODO: Replace with real queries to your 'orders' and 'products' tables.
      // Example for stats:
      // const { data: ordersData, error: ordersError } = await supabase
      //   .from('orders')
      //   .select('total_price, order_items(quantity)')
      //   .eq('vendor_id', user.id);
      
      // if (ordersData) {
      //   const totalRevenue = ordersData.reduce((acc, o) => acc + o.total_price, 0);
      //   const totalOrders = ordersData.length;
      //   const productsSoldCount = ordersData.reduce((acc, o) => acc + o.order_items.reduce((i_acc, i) => i_acc + i.quantity, 0), 0);
      //   setStats({ revenue: totalRevenue, orders: totalOrders, productsSold: productsSoldCount });
      // }
      
      setStats({ revenue: 0, orders: 0, productsSold: 0 });
      setSalesData([]);
      setRecentOrders([]);

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
        <p className="text-muted-foreground">An overview of your sales and performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard 
            title="Total Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={DollarSign} 
            change={loading ? 'Loading...' : 'No sales yet'} 
        />
        <StatsCard 
            title="Total Orders" 
            value={stats.orders.toString()} 
            icon={ShoppingCart} 
            change={loading ? 'Loading...' : 'No orders yet'} 
        />
        <StatsCard 
            title="Products Sold" 
            value={stats.productsSold.toString()} 
            icon={BookOpen} 
            change={loading ? 'Loading...' : 'No products sold yet'} 
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
  );
}

    
