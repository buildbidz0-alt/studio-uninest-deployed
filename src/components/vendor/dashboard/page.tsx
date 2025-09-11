
'use client';

import { useEffect, useState, useMemo } from 'react';
import StatsCard from '@/components/vendor/stats-card';
import SalesChart from '@/components/vendor/sales-chart';
import RecentOrdersTable from '@/components/vendor/recent-orders-table';
import { DollarSign, ShoppingCart, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Order, OrderItem } from '@/lib/types';
import { subDays, format, startOfDay } from 'date-fns';

export default function VendorDashboardContent() {
  const { user, supabase } = useAuth();
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
    const productsSoldCount = orders.reduce((acc, o) => acc + o.order_items.reduce((i_acc, i) => i_acc + i.quantity, 0), 0);
    return { revenue: totalRevenue, orders: totalOrders, productsSold: productsSoldCount };
  }, [orders]);

  const salesData = useMemo(() => {
    const last7Days: { name: string, total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      last7Days.push({ name: format(date, 'MMM d'), total: 0 });
    }

    orders.forEach(order => {
      const orderDate = startOfDay(new Date(order.created_at));
      const day = last7Days.find(d => startOfDay(new Date(d.name)) .getTime() === orderDate.getTime());
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
            change={loading ? 'Loading...' : `${stats.orders} sales`} 
        />
        <StatsCard 
            title="Total Orders" 
            value={stats.orders.toString()} 
            icon={ShoppingCart} 
            change={loading ? 'Loading...' : `from ${[...new Set(orders.map(o => o.buyer_id))].length} customers`} 
        />
        <StatsCard 
            title="Products Sold" 
            value={stats.productsSold.toString()} 
            icon={BookOpen} 
            change={loading ? 'Loading...' : 'items sold'} 
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
