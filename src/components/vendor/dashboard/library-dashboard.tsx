
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, PlusCircle, Users, Settings, Clock, ThumbsUp, X, Loader2 } from "lucide-react";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type LibraryDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function LibraryDashboard({ products, orders }: LibraryDashboardProps) {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const [libraryDetails, setLibraryDetails] = useState({
        totalSeats: 50,
        price: 10,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if(user?.user_metadata?.library_details) {
            setLibraryDetails(user.user_metadata.library_details);
        }
    }, [user]);

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval');
    const approvedBookings = orders.filter(o => o.status === 'approved');

    const handleDetailsUpdate = async () => {
        if(!supabase || !user) return;
        setIsUpdating(true);
        
        // 1. Update user metadata with the config
        const { error: metaError } = await supabase.auth.updateUser({
            data: { library_details: libraryDetails }
        });
        
        if (metaError) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update library details.' });
            setIsUpdating(false);
            return;
        }

        // 2. Ensure products exist for each seat. This is idempotent.
        const existingSeatProducts = products.filter(p => p.category === 'Library Seat');
        const seatNumbers = new Set(existingSeatProducts.map(p => parseInt(p.name.split(' ')[1])));

        const productsToCreate = [];
        for (let i = 1; i <= libraryDetails.totalSeats; i++) {
            if (!seatNumbers.has(i)) {
                productsToCreate.push({
                    name: `Seat ${i}`,
                    description: `Reservation for Seat ${i} in the library.`,
                    price: libraryDetails.price,
                    category: 'Library Seat', // A hidden category
                    seller_id: user.id,
                });
            }
        }
        
        if (productsToCreate.length > 0) {
            const { error: productError } = await supabase.from('products').insert(productsToCreate);
            if (productError) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not create seat products.' });
                 setIsUpdating(false);
                 return;
            }
        }
        
        toast({ title: 'Success', description: 'Library details and seat listings updated.' });
        setIsUpdating(false);
        router.refresh();
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
                                <Input id="totalSeats" type="number" value={libraryDetails.totalSeats} onChange={(e) => setLibraryDetails(d => ({...d, totalSeats: parseInt(e.target.value) || 0}))} />
                                <p className="text-sm text-muted-foreground">This will create a hidden product for each seat.</p>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="price">Price per Seat (₹)</Label>
                                <Input id="price" type="number" value={libraryDetails.price} onChange={(e) => setLibraryDetails(d => ({...d, price: parseInt(e.target.value) || 0}))} />
                                <p className="text-sm text-muted-foreground">This is the price students will pay at the library.</p>
                            </div>
                        </div>
                         <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleDetailsUpdate} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Seat Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Total Seats</span><span className="font-bold">{libraryDetails.totalSeats}</span></div>
                        <div className="flex justify-between"><span>Booked</span><span className="font-bold text-green-500">{approvedBookings.length}</span></div>
                        <div className="flex justify-between"><span>Available</span><span className="font-bold">{libraryDetails.totalSeats - approvedBookings.length}</span></div>
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
