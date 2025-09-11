
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "@/components/admin/settings/form";
import type { MonetizationSettings } from "@/lib/types";

export default async function AdminSettingsPage() {
    const supabase = createClient();
    const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();
        
    const settings = data?.value as MonetizationSettings || { charge_for_posts: false, post_price: 10, start_date: null };

    return (
        <div className="space-y-8">
            <PageHeader title="Platform Settings" description="Configure global settings for the application." />
             <Card>
                <CardHeader>
                    <CardTitle>Monetization</CardTitle>
                    <CardDescription>Manage settings for charging users for services like posting listings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm currentSettings={settings} />
                </CardContent>
            </Card>
        </div>
    )
}
