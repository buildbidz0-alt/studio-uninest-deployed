
import PageHeader from "@/components/admin/page-header";

export default function AdminPaymentsPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="Payment History" description="View and manage all transactions." />
            <div className="text-center text-muted-foreground py-16">
              <h2 className="text-xl font-semibold">Payments Table Coming Soon</h2>
              <p>This section will contain a data table for viewing transactions and issuing refunds.</p>
            </div>
        </div>
    )
}
