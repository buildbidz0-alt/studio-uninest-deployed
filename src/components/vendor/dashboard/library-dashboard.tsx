
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, PlusCircle, Users, Settings, Clock, ThumbsUp, X } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LibraryDashboardProps = {
    products: Product[];
    orders: any[];
}

// A mock library details object. In a real app, this would be fetched from the DB.
const initialLibraryDetails = {
    totalSeats: 50,
    shift1: '09:00-13:00',
    shift2: '14:00-18:00',
    price: 10,
};

export default function LibraryDashboard({ products, orders }: LibraryDashboardProps) {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [libraryDetails, setLibraryDetails] = useState(initialLibraryDetails);
    const [isUpdating, setIsUpdating] = useState(false);

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval');

    const handleDetailsUpdate = async () => {
        if(!supabase || !user) return;
        setIsUpdating(true);
        // In a real app, you would update a 'libraries' table.
        // Here we'll update the user's metadata as a stand-in.
        const { error } = await supabase.auth.updateUser({
            data: { library_details: libraryDetails }
        });
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update library details.' });
        } else {
            toast({ title: 'Success', description: 'Library details updated.' });
        }
        setIsUpdating(false);
    }
    
    const handleApproval = async (orderId: number, newStatus: 'approved' | 'rejected') => {
        if (!supabase) return;
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} booking.` });
        } else {
            toast({ title: 'Success', description: `Booking has been ${newStatus === 'approved' ? 'approved' : 'rejected'}.` });
            router.refresh();
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Library Management</h2>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Settings className="mr-2"/> Configure Library</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Library Configuration</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="totalSeats">Total Seats</Label>
                                <Input id="totalSeats" type="number" value={libraryDetails.totalSeats} onChange={(e) => setLibraryDetails(d => ({...d, totalSeats: parseInt(e.target.value)}))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="shift1">Shift 1</Label>
                                    <Input id="shift1" value={libraryDetails.shift1} onChange={(e) => setLibraryDetails(d => ({...d, shift1: e.target.value}))} />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="shift2">Shift 2</Label>
                                    <Input id="shift2" value={libraryDetails.shift2} onChange={(e) => setLibraryDetails(d => ({...d, shift2: e.target.value}))} />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="price">Price per Seat (₹)</Label>
                                <Input id="price" type="number" value={libraryDetails.price} onChange={(e) => setLibraryDetails(d => ({...d, price: parseInt(e.target.value)}))} />
                            </div>
                            <Button onClick={handleDetailsUpdate} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Seat Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Total Seats</span><span className="font-bold">{libraryDetails.totalSeats}</span></div>
                        <div className="flex justify-between"><span>Booked</span><span className="font-bold text-green-500">{orders.filter(o => o.status === 'approved').length}</span></div>
                        <div className="flex justify-between"><span>Available</span><span className="font-bold">{libraryDetails.totalSeats - orders.filter(o => o.status === 'approved').length}</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="text-primary"/> Shifts</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="flex justify-between"><span>Shift 1</span><span className="font-bold">{libraryDetails.shift1}</span></div>
                         <div className="flex justify-between"><span>Shift 2</span><span className="font-bold">{libraryDetails.shift2}</span></div>
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
                                    <TableHead>Seat/Service</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApprovals.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            {booking.order_items?.map((oi: any) => oi.products?.name || 'Unknown').join(', ') || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleApproval(booking.id, 'approved')}><ThumbsUp /></Button>
                                            <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleApproval(booking.id, 'rejected')}><X /></Button>
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
