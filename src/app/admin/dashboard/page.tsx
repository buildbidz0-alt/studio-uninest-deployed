
import PageHeader from '@/components/admin/page-header';
import AdminDashboardContent from '@/components/admin/dashboard/page';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="An overview of your platform's performance." />
      <AdminDashboardContent />
    </div>
  );
}
