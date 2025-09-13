
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Users, IndianRupee, Wrench, Calendar, PlusCircle, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type HostelDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function HostelDashboard({ products, orders }: HostelDashboardProps) {
    const rooms = products;
    const recentActivity = orders.slice(0, 5);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const uniqueTenants = new Set(orders.map(o => o.buyer_id)).size;

    const stats = { revenue: totalRevenue, tenants: uniqueTenants, maintenance: 0 };

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
                        <p className="text-3xl font-bold">{stats.tenants}</p>
                        <p className="text-sm text-muted-foreground">based on unique orders</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
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
                        <Button asChild><Link href="/vendor/products/new"><PlusCircle className="mr-2"/> Add Room</Link></Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     {rooms.length > 0 ? (
                        rooms.map(room => (
                             <Link key={room.id} href={`/vendor/products/${room.id}/edit`}>
                                <div className="p-4 rounded-lg border-2 bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800 hover:border-primary hover:bg-primary/10 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-lg truncate" title={room.name}>{room.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                        <IndianRupee className="size-4"/>
                                        <span>{room.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
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
                     {recentActivity.length > 0 ? (
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
