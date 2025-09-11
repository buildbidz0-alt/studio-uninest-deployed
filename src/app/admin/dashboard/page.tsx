
import PageHeader from '@/components/admin/page-header';
import AdminDashboardContent from '@/components/admin/dashboard/page';
import { createClient } from '@/lib/supabase/server';
import TopDonorsTable from '@/components/admin/top-donors-table';

type AggregatedDonor = {
  name: string;
  email: string;
  avatar: string | null;
  total: number;
};

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: topDonors, error } = await supabase
      .from('donations')
      .select(`
          amount,
          profiles (
              full_name,
              email,
              avatar_url
          )
      `)
      .order('amount', { ascending: false })
      .limit(10);

  // Manual aggregation in JS
  const aggregatedDonors: AggregatedDonor[] = (topDonors || []).reduce((acc: any[], current) => {
      if (!current.profiles) return acc;
      const existing = acc.find(d => d.email === current.profiles!.email);
      if (existing) {
          existing.total += current.amount;
      } else {
          acc.push({
              name: current.profiles.full_name,
              email: current.profiles.email,
              avatar: current.profiles.avatar_url,
              total: current.amount
          });
      }
      return acc;
  }, []).sort((a,b) => b.total - a.total).slice(0, 5);


  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="An overview of your platform's performance." />
      <AdminDashboardContent topDonors={aggregatedDonors} />
    </div>
  );
}
