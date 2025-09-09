
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/marketplace/product-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function NewListingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }
    
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageHeader title="Create New Listing" description="Fill out the form to add a new product to the marketplace." />
            <ProductForm />
        </div>
    )
}
