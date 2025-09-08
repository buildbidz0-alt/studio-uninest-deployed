
import { DollarSign, Users, ShoppingCart, Gift } from 'lucide-react';
import StatsCard from '@/components/admin/stats-card';
import PageHeader from '@/components/admin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MonthlyRevenueChart from '@/components/admin/charts/monthly-revenue-chart';
import ListingsByCategoryChart from '@/components/admin/charts/listings-by-category-chart';
import TopDonorsTable from '@/components/admin/top-donors-table';

export default function AdminDashboardPage() {
  // TODO: Fetch data from your backend API
  // Example endpoints:
  // - /admin/analytics/stats
  // - /admin/analytics/revenue/monthly
  // - /admin/analytics/listings/counts
  // - /admin/analytics/top/donors
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="An overview of your platform's performance." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Total Revenue (MTD)" 
            value="₹0" 
            icon={DollarSign} 
            change="No data available" 
        />
        <StatsCard 
            title="Donations (MTD)" 
            value="₹0" 
            icon={Gift} 
            change="No data available" 
        />
        <StatsCard 
            title="Active Users (Daily)" 
            value="0" 
            icon={Users} 
            change="No data available" 
        />
        <StatsCard 
            title="Active Listings" 
            value="0" 
            icon={ShoppingCart} 
            change="No data available" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
           <MonthlyRevenueChart />
        </div>
         <div className="lg:col-span-2">
            <ListingsByCategoryChart />
        </div>
      </div>
       <div className="grid grid-cols-1">
          <TopDonorsTable />
       </div>
    </div>
  );
}
