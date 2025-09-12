
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, PlusCircle, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Order, Product } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function LibraryDashboard() {
    const { supabase, user } = useAuth();
    const [books, setBooks] = useState<Product[]>([]);
    const [recentBookings, setRecentBookings] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !supabase) return;
            setLoading(true);

            // Fetch books (products in "Library Services" category)
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .eq('category', 'Library Services');

            if (productsData) {
                setBooks(productsData as Product[]);
            }

            // Fetch bookings (orders for library services)
            const { data: ordersData } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items(products(name, category)),
                    buyer:profiles!buyer_id(full_name)
                `)
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersData) {
                const libraryOrders = (ordersData as any[]).filter(order =>
                    order.order_items.some((oi: any) => oi.products.category === 'Library Services')
                );
                setRecentBookings(libraryOrders.slice(0, 3) as Order[]);
            }

            setLoading(false);
        };
        fetchData();
    }, [user, supabase]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Library Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Live Booking Status</CardTitle>
                        <CardDescription>Real-time overview of library seat occupation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex flex-col items-center justify-center h-48">
                         <p className="text-muted-foreground">Live seat booking feature is coming soon!</p>
                         <Button asChild>
                            <Link href="/booking">View Booking Page</Link>
                         </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Book className="text-primary"/> Book Catalog</CardTitle>
                        <CardDescription>Summary of your book inventory.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Books</span>
                             {loading ? <Loader2 className="animate-spin size-4" /> : <span className="font-bold">{books.length}</span>}
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Books Issued</span>
                             <span className="font-bold">0</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-red-500 font-bold">Overdue</span>
                            <span className="font-bold text-red-500">0</span>
                         </div>
                         <Button asChild className="w-full mt-2" variant="outline"><Link href="/vendor/products">Manage Catalog</Link></Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Recent Seat Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : recentBookings.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBookings.map(booking => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.buyer.full_name}</TableCell>
                                            <TableCell>{booking.order_items.map(oi => oi.products.name).join(', ')}</TableCell>
                                            <TableCell><CheckCircle className="size-5 text-green-500"/></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No recent bookings found.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Membership Plans</CardTitle>
                        <CardDescription>Manage weekly and monthly subscriptions.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4 pt-6">
                         <p className="text-muted-foreground">This feature is coming soon!</p>
                         <Button className="w-full" disabled><PlusCircle className="mr-2"/> Create New Plan</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
