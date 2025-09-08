
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="User Management" description="View, ban, or unban users.">
                <Button>Add User</Button>
            </PageHeader>
            <div className="text-center text-muted-foreground py-16">
              <h2 className="text-xl font-semibold">User Table Coming Soon</h2>
              <p>This section will contain a data table for managing all platform users.</p>
            </div>
        </div>
    )
}
