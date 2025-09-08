
import PageHeader from "@/components/admin/page-header";

export default function AdminLogsPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="Audit Logs" description="Track all administrative actions." />
            <div className="text-center text-muted-foreground py-16">
              <h2 className="text-xl font-semibold">Audit Log Table Coming Soon</h2>
              <p>This section will display a read-only log of all actions taken by admins.</p>
            </div>
        </div>
    )
}
