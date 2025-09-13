
'use client';

import PageHeader from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Library, Utensils, Bed, Laptop, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const categoryDashboards = [
    { id: "library", label: "Library Hub", icon: Library, color: 'text-purple-500' },
    { id: "food mess", label: "Food Mess Hub", icon: Utensils, color: 'text-orange-500' },
    { id: "hostels", label: "Hostel Hub", icon: Bed, color: 'text-blue-500' },
    { id: "cybercafe", label: "Cybercafé Hub", icon: Laptop, color: 'text-green-500' },
];

type VendorDashboardContentProps = {
    userName: string;
    vendorCategories: string[];
}

export default function VendorDashboardContent({ userName, vendorCategories }: VendorDashboardContentProps) {

  const vendorSpecificDashboards = categoryDashboards.filter(dash => vendorCategories.includes(dash.id));
  
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={`Welcome, ${userName}. Here's your main hub.`} />

       {vendorSpecificDashboards.length > 0 ? (
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Your Service Dashboards</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendorSpecificDashboards.map(dash => (
                     <Link key={dash.id} href={`/vendor/dashboard/${dash.id.replace(/\s+/g, '-')}`}>
                        <Card className="hover:shadow-lg transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <dash.icon className={`size-8 ${dash.color}`} />
                                    <CardTitle className="text-xl">{dash.label}</CardTitle>
                                </div>
                                <ArrowRight className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Click to manage your {dash.label.replace(' Hub', '').toLowerCase()} services, view specific orders, and see detailed analytics.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
       ) : (
        <Card className="text-center p-8">
            <CardTitle>Get Started as a Vendor</CardTitle>
            <CardDescription className="mt-2">You haven't configured any services yet.</CardDescription>
            <Button asChild className="mt-4">
                <Link href="/settings">Configure Your Services</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Go to your settings to select the services you provide (e.g., Library, Hostels).</p>
        </Card>
       )}
    </div>
  );
}
