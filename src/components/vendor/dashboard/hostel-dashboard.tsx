

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Users, IndianRupee, Wrench, Calendar, PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import type { Order, Product } from "@/lib/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function HostelDashboard() {
    const { supabase, user } = useAuth();
    const [rooms, setRooms] = useState<Product[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]); // Use any for safety
    const [stats, setStats] = useState({ revenue: 0, tenants: 0, maintenance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !supabase) return;
            setLoading(true);

            // Fetch rooms (products in "Hostels" category)
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .eq('category', 'Hostels');

            if (productsData) {
                setRooms(productsData as Product[]);
            }
            
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total_amount,
                    buyer_id,
                    buyer:profiles(full_name),
                    order_items!inner(
                        products!inner(name, category)
                    )
                `)
                .eq('vendor_id', user.id)
                .eq('order_items.products.category', 'Hostels')
                .order('created_at', { ascending: false });
            
            if (ordersError) {
                console.error("Error fetching hostel orders:", ordersError);
            } else if (ordersData) {
                const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
                const uniqueTenants = new Set(ordersData.map(o => o.buyer_id)).size;

                setRecentActivity(ordersData.slice(0, 5));
                setStats(prev => ({ ...prev, revenue: totalRevenue, tenants: uniqueTenants }));
            }

            setLoading(false);
        };
        fetchData();
    }, [user, supabase]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Hostel Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Tenants</CardTitle>
                        <Users className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">{stats.tenants}</p>}
                        <p className="text-sm text-muted-foreground">based on unique orders</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>}
                        <p className="text-sm text-muted-foreground">from all bookings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Maintenance</CardTitle>
                        <Wrench className="text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.maintenance}</p>
                        <p className="text-sm text-muted-foreground">requests open</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bed className="text-primary"/> Room Listings</CardTitle>
                        <CardDescription>Overview of your hostel room listings.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled><Calendar className="mr-2"/> Manage Bookings</Button>
                        <Button asChild><Link href="/marketplace/new"><PlusCircle className="mr-2"/> Add Room</Link></Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     {loading ? <Loader2 className="animate-spin" /> : rooms.length > 0 ? (
                        rooms.map(room => (
                            <div key={room.id} className="p-4 rounded-lg border-2 bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-lg truncate" title={room.name}>{room.name}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <IndianRupee className="size-4"/>
                                    <span>{room.price.toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                         <p className="text-muted-foreground text-center py-10 col-span-full">No rooms listed yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                     {loading ? <Loader2 className="animate-spin" /> : recentActivity.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Activity</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="size-4 text-green-500"/>
                                                <span className="capitalize">New Booking</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{activity.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>{activity.order_items.map((oi: any) => oi.products?.name || 'Unknown Item').join(', ')}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <p className="text-muted-foreground text-center py-10">No recent bookings.</p>
                     )}
                </CardContent>
            </Card>

        </div>
    );
}
