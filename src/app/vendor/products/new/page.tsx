
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/marketplace/product-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import type { MonetizationSettings } from "@/lib/types";

// This page is a wrapper to provide a vendor-specific route for the product form.
export default async function NewVendorProductPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }
    
    const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();
        
    const monetizationSettings = settingsData?.value as MonetizationSettings || { charge_for_posts: false, post_price: 10, start_date: null };

    const isChargingActive = () => {
        if (!monetizationSettings.charge_for_posts) {
            return false;
        }
        if (monetizationSettings.start_date) {
            return new Date() >= new Date(monetizationSettings.start_date);
        }
        return true;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageHeader title="Create New Product" description="Fill out the form to add a new item to your listings." />
            <ProductForm 
                chargeForPosts={isChargingActive()}
                postPrice={monetizationSettings.post_price}
            />
        </div>
    )
}
