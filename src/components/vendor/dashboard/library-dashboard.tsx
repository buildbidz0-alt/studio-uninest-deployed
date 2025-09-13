
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, PlusCircle, Users, Settings, Clock, ThumbsUp, X, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LibraryDashboardProps = {
    products: Product[]; // This will contain library listings
    orders: any[];
}

export default function LibraryDashboard({ products, orders: initialOrders }: LibraryDashboardProps) {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const library = products.find(p => p.category === 'Library');

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval' && o.order_items[0]?.library_id === library?.id);
    const approvedBookings = orders.filter(o => o.status === 'approved' && o.order_items[0]?.library_id === library?.id);
    const totalSeats = library?.total_seats || 0;

    const handleApproval = async (orderId: number, newStatus: 'approved' | 'rejected') => {
        if (!supabase) return;
        setUpdatingOrderId(orderId);
        
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} booking.` });
        } else {
            toast({ title: 'Success', description: `Booking has been ${newStatus}.` });
            // Optimistic UI update
            setOrders(currentOrders => currentOrders.filter(o => o.id !== orderId));
        }
        setUpdatingOrderId(null);
    }

    if (!library) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">No Library Found</h2>
                <p className="text-muted-foreground mt-2">You haven't created a library listing yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/vendor/products/new"><PlusCircle className="mr-2"/> Create Library Listing</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{library.name} - Dashboard</h2>
                 <Button variant="outline" asChild>
                    <Link href={`/vendor/products/${library.id}/edit`}>
                        <Settings className="mr-2"/> Configure Library
                    </Link>
                </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Seat Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Total Seats</span><span className="font-bold">{totalSeats}</span></div>
                        <div className="flex justify-between"><span>Booked</span><span className="font-bold text-green-500">{approvedBookings.length}</span></div>
                        <div className="flex justify-between"><span>Available</span><span className="font-bold">{totalSeats - approvedBookings.length}</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Memberships</CardTitle></CardHeader>
                    <CardContent className="text-center text-muted-foreground pt-4">
                        <p>Membership feature coming soon!</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>Pending Approvals ({pendingApprovals.length})</CardTitle>
                    <CardDescription>Review and approve or reject seat reservation requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingApprovals.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApprovals.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            Seat {booking.order_items?.map((oi: any) => oi.seat_number || 'N/A').join(', ') || 'N/A'}
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
                        <p className="text-muted-foreground text-center py-10">No pending approvals.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
