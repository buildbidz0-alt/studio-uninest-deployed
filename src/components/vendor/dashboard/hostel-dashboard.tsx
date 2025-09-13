
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Users, IndianRupee, Settings, PlusCircle, ThumbsUp, X, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type HostelDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function HostelDashboard({ products, orders: initialOrders }: HostelDashboardProps) {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState(initialOrders);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    
    const hostels = products.filter(p => p.category === 'Hostels');
    const rooms = products.filter(p => p.category === 'Hostel Room');

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval' && o.order_items[0]?.products?.category === 'Hostel Room');

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const uniqueTenants = new Set(orders.map(o => o.buyer_id)).size;

    const stats = { revenue: totalRevenue, tenants: uniqueTenants };
    
    const handleApproval = async (orderId: number, newStatus: 'approved' | 'rejected') => {
        if (!supabase) return;
        setUpdatingOrderId(orderId);
        
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} booking.` });
        } else {
            toast({ title: 'Success', description: `Booking has been ${newStatus}.` });
            setOrders(currentOrders => currentOrders.filter(o => o.id !== orderId));
        }
        setUpdatingOrderId(null);
    }

    if (hostels.length === 0) {
       return (
         <div className="text-center py-10">
                <h2 className="text-2xl font-bold">No Hostel Found</h2>
                <p className="text-muted-foreground mt-2">You haven't created a hostel listing yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/marketplace/new"><PlusCircle className="mr-2"/> Create Hostel Listing</Link>
                </Button>
            </div>
       )
    }

    // Assuming a vendor manages one hostel for simplicity
    const hostel = hostels[0];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{hostel.name} - Dashboard</h2>
                 <Button variant="outline" asChild>
                    <Link href={`/vendor/products/${hostel.id}/edit`}>
                        <Settings className="mr-2"/> Configure Hostel
                    </Link>
                </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Tenants</CardTitle>
                        <Users className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.tenants}</p>
                        <p className="text-sm text-muted-foreground">based on unique bookings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">from all-time bookings</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bed className="text-primary"/> Room Listings</CardTitle>
                        <CardDescription>Manage your available rooms.</CardDescription>
                    </div>
                    <Button asChild><Link href="/marketplace/new"><PlusCircle className="mr-2"/> Add Room</Link></Button>
                </CardHeader>
                 <CardContent>
                     {rooms.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room Name/Number</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map(room => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.name}</TableCell>
                                        <TableCell>₹{room.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/vendor/products/${room.id}/edit`}>Edit</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <p className="text-muted-foreground text-center py-10 col-span-full">No rooms listed yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Pending Bookings ({pendingApprovals.length})</CardTitle>
                    <CardDescription>Approve or reject new room booking requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     {pendingApprovals.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApprovals.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            {booking.order_items.map((oi: any) => oi.products?.name || 'N/A').join(', ')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{booking.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {updatingOrderId === booking.id ? (
                                                <Loader2 className="size-5 animate-spin inline-flex" />
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleApproval(booking.id, 'approved')}><ThumbsUp /></Button>
                                                    <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleApproval(booking.id, 'rejected')}><X /></Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <p className="text-muted-foreground text-center py-10">No pending bookings.</p>
                     )}
                </CardContent>
            </Card>

        </div>
    );
}
