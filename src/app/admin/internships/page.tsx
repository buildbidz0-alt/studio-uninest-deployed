
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import InternshipsTable from "@/components/admin/internships/table";

export const revalidate = 0; // force dynamic rendering

export default async function AdminInternshipsPage() {
    const supabase = createClient();

    const { data: internships, error } = await supabase
        .from('internships')
        .select('*, internship_applications(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="Internships" description="Manage all internship listings.">
                 <Button asChild>
                    <Link href="/admin/internships/new">
                        <PlusCircle className="mr-2 size-4" />
                        Add New
                    </Link>
                 </Button>
            </PageHeader>
            <InternshipsTable internships={internships || []} error={error?.message} />
        </div>
    )
}
