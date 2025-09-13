
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Computer, IndianRupee, PlusCircle, Check, Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from "next/link";

// Mock data for charts, as we don't have time-series data
const usageData = [
  { time: '10 AM', users: 5 }, { time: '11 AM', users: 8 },
  { time: '12 PM', users: 12 }, { time: '1 PM', users: 15 },
  { time: '2 PM', users: 14 }, { time: '3 PM', users: 18 },
  { time: '4 PM', users: 22 }, { time: '5 PM', users: 20 },
  { time: '6 PM', users: 16 },
];

export default function CybercafeDashboard() {
    const { supabase, user } = useAuth();
    const [services, setServices] = useState<Product[]>([]);
    const [stats, setStats] = useState({ revenue: 0, orders: 0 });
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !supabase) return;
            setLoading(true);

            // Fetch services/rate plans
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .eq('category', 'Cyber Café');

            if (productsData) {
                setServices(productsData as Product[]);
            }

            // Fetch orders for stats
             const { data: ordersData, error } = await supabase
              .from('orders')
              .select('total_amount, order_items!inner(products!inner(category))')
              .eq('vendor_id', user.id)
              .eq('order_items.products.category', 'Cyber Café');

            if (ordersData) {
                const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
                setStats({ revenue: totalRevenue, orders: ordersData.length });
            }

            setLoading(false);
        };
        fetchData();
    }, [user, supabase]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Cybercafé Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Plans/Services</CardTitle>
                        <Computer className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">{services.length}</p>}
                        <p className="text-sm text-muted-foreground">Active service listings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Orders</CardTitle>
                        <Check className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">{stats.orders}</p>}
                         <p className="text-sm text-muted-foreground">Across all services</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                         {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>}
                         <p className="text-sm text-muted-foreground">from all-time sales</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Usage Hours</CardTitle>
                        <CardDescription>Identify when your café is busiest (demo data).</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={usageData}>
                                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))' 
                                    }}
                                    label="Users"
                                />
                                <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <CardTitle>Rate Plans</CardTitle>
                            <CardDescription>Manage your service pricing.</CardDescription>
                        </div>
                        <Button asChild>
                           <Link href="/marketplace/new">
                             <PlusCircle className="mr-2"/> Add New Plan
                           </Link>
                        </Button>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {loading ? <Loader2 className="animate-spin" /> : services.length > 0 ? (
                            services.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Computer className="size-5 text-primary" />
                                        <span className="font-semibold">{plan.name}</span>
                                    </div>
                                    <span className="font-bold">₹{plan.price.toLocaleString()}/hr</span>
                                </div>
                            ))
                         ) : (
                            <p className="text-muted-foreground text-center py-10">No service plans found.</p>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
