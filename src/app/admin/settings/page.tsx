
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "@/components/admin/settings/form";
import type { MonetizationSettings } from "@/lib/types";

const defaultSettings: MonetizationSettings = {
    student: {
        charge_for_posts: false,
        post_price: 10,
    },
    vendor: {
        charge_for_platform_access: false,
        price_per_service_per_month: 500,
    },
    start_date: null,
};

export default async function AdminSettingsPage() {
    const supabase = createClient();
    const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();
        
    const settings: MonetizationSettings = {
        ...defaultSettings,
        ...(data?.value as Partial<MonetizationSettings> || {}),
        student: { ...defaultSettings.student, ...(data?.value as any)?.student },
        vendor: { ...defaultSettings.vendor, ...(data?.value as any)?.vendor },
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Platform Settings" description="Configure global settings for the application." />
             <Card>
                <CardHeader>
                    <CardTitle>Monetization</CardTitle>
                    <CardDescription>Manage how students and vendors are charged for using the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm currentSettings={settings} />
                </CardContent>
            </Card>
        </div>
    )
}
