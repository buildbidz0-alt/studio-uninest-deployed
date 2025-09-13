
import PageHeader from "@/components/admin/page-header";
import SQLEditor from "@/components/admin/sql-editor/editor";

export default function AdminSQLPage() {
    return (
        <div className="space-y-8 h-full flex flex-col">
            <PageHeader 
                title="SQL Editor" 
                description="Run raw SQL queries against your database. Use with caution." 
            />
            <div className="flex-grow">
                 <SQLEditor />
            </div>
        </div>
    )
}
