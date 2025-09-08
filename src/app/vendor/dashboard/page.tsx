
import StatsCard from '@/components/vendor/stats-card';
import SalesChart from '@/components/vendor/sales-chart';
import RecentOrdersTable from '@/components/vendor/recent-orders-table';
import { DollarSign, ShoppingCart, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Uninest',
  description: 'Manage your listings, orders, and payouts.',
};

export default function VendorDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
        <p className="text-muted-foreground">An overview of your sales and performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Revenue" value="₹0.00" icon={DollarSign} change="No sales yet" />
        <StatsCard title="Total Orders" value="0" icon={ShoppingCart} change="No orders yet" />
        <StatsCard title="Products Sold" value="0" icon={BookOpen} change="No products sold yet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
}
