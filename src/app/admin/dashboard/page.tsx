
import { DollarSign, Users, ShoppingCart, Gift } from 'lucide-react';
import StatsCard from '@/components/admin/stats-card';
import PageHeader from '@/components/admin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MonthlyRevenueChart from '@/components/admin/charts/monthly-revenue-chart';
import ListingsByCategoryChart from '@/components/admin/charts/listings-by-category-chart';
import TopDonorsTable from '@/components/admin/top-donors-table';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="An overview of your platform's performance." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Total Revenue (MTD)" 
            value="₹12,540" 
            icon={DollarSign} 
            change="+15.2% from last month" 
        />
        <StatsCard 
            title="Donations (MTD)" 
            value="₹3,500" 
            icon={Gift} 
            change="+5.1% from last month" 
        />
        <StatsCard 
            title="Active Users (Daily)" 
            value="1,234" 
            icon={Users} 
            change="+30 since yesterday" 
        />
        <StatsCard 
            title="Active Listings" 
            value="452" 
            icon={ShoppingCart} 
            change="+12 since last week" 
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
