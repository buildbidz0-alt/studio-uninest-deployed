
'use client';

import { DollarSign, Users, ShoppingCart, Gift, Loader2 } from 'lucide-react';
import StatsCard from '@/components/admin/stats-card';
import MonthlyRevenueChart from '@/components/admin/charts/monthly-revenue-chart';
import ListingsByCategoryChart from '@/components/admin/charts/listings-by-category-chart';
import TopDonorsTable from '@/components/admin/top-donors-table';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { subMonths, startOfMonth, format, getMonth, getYear } from 'date-fns';

const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
];

type Donation = {
  amount: number;
  created_at: string;
}

type CompetitionEntry = {
  competitions: {
    entry_fee: number;
  } | null;
  created_at: string;
}

export default function AdminDashboardContent() {
  const [stats, setStats] = useState({ revenue: 0, donations: 0, users: 0, listings: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationsData, setDonationsData] = useState<Donation[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch stats
      const { data: usersData } = await supabase.from('profiles').select('id', { count: 'exact' });
      const { data: listingsData } = await supabase.from('products').select('id', { count: 'exact' });
      const { data: fetchedDonationsData } = await supabase.from('donations').select('amount, created_at');
      const { data: competitionEntries } = await supabase.from('competition_entries').select('competitions(entry_fee), created_at');

      setDonationsData(fetchedDonationsData as Donation[] | null);

      const totalDonations = fetchedDonationsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const totalCompetitionFees = (competitionEntries as CompetitionEntry[] | null)?.reduce((sum, e) => sum + (e.competitions?.entry_fee || 0), 0) || 0;
      
      setStats({
        users: usersData?.length || 0,
        listings: listingsData?.length || 0,
        donations: totalDonations,
        revenue: totalDonations + totalCompetitionFees,
      });

      // Fetch chart data
      // Monthly Revenue (last 12 months)
      const allTransactions: {amount: number, created_at: string}[] = [
        ...(fetchedDonationsData || []).map(d => ({ amount: d.amount, created_at: d.created_at })),
        ...(competitionEntries || []).map((c: CompetitionEntry) => ({ amount: c.competitions?.entry_fee || 0, created_at: c.created_at }))
      ].filter(t => t.amount > 0);

      const monthlyRevenue: { [key: string]: number } = {};
      for (let i = 0; i < 12; i++) {
          const date = subMonths(new Date(), i);
          const monthKey = format(date, 'MMM yy');
          monthlyRevenue[monthKey] = 0;
      }
      allTransactions.forEach(t => {
          const monthKey = format(new Date(t.created_at), 'MMM yy');
          if (monthlyRevenue.hasOwnProperty(monthKey)) {
              monthlyRevenue[monthKey] += t.amount;
          }
      });
      const revenueChartData = Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue })).reverse();
      setRevenueData(revenueChartData);


      // Listings by category
      const { data: categories } = await supabase
        .from('products')
        .select('category');

      if (categories) {
          const counts = categories.reduce((acc, { category }) => {
              acc[category] = (acc[category] || 0) + 1;
              return acc;
          }, {} as Record<string, number>);
          
          const categoryChartData = Object.entries(counts).map(([name, value], index) => ({
              name,
              value,
              fill: chartColors[index % chartColors.length]
          }));
          setCategoryData(categoryChartData);
      }


      setLoading(false);
    };

    fetchData();
  }, [supabase]);


  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Total Revenue (All Time)" 
            value={`₹${stats.revenue.toLocaleString()}`}
            icon={DollarSign} 
            change={loading ? 'Loading...' : 'Across all transactions'} 
        />
        <StatsCard 
            title="Total Donations" 
            value={`₹${stats.donations.toLocaleString()}`}
            icon={Gift} 
            change={loading ? 'Loading...' : `${donationsData?.length || 0} donations`}
        />
        <StatsCard 
            title="Total Users" 
            value={stats.users.toLocaleString()}
            icon={Users} 
            change={loading ? 'Loading...' : 'Signed up users'} 
        />
        <StatsCard 
            title="Active Listings" 
            value={stats.listings.toLocaleString()}
            icon={ShoppingCart} 
            change={loading ? 'Loading...' : 'In marketplace'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
           <MonthlyRevenueChart data={revenueData} loading={loading} />
        </div>
         <div className="lg:col-span-2">
            <ListingsByCategoryChart data={categoryData} loading={loading} />
        </div>
      </div>
       <div className="grid grid-cols-1">
          {/* This component is now a Server Component, so we pass loading state if needed or let it handle its own */}
       </div>
    </>
  );
}
