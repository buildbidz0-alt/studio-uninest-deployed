
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Utensils, PlusCircle, Users, IndianRupee, ChefHat, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Order, Product } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function FoodMessDashboard() {
    const { supabase, user } = useAuth();
    const [menuItems, setMenuItems] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ revenue: 0, orders: 0, subscriptions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !supabase) return;
            setLoading(true);

            // Fetch menu items (products in "Food Mess" category)
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .eq('category', 'Food Mess');
            
            if (productsData) {
                setMenuItems(productsData as Product[]);
            }

            // Fetch orders for stats and recent activity
            const { data: ordersData } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        products ( name, category )
                    ),
                    buyer:profiles!buyer_id(full_name)
                `)
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersData) {
                const foodOrders = (ordersData as any[]).filter(order => 
                    order.order_items.some((oi: any) => oi.products?.category === 'Food Mess')
                );

                const totalRevenue = foodOrders.reduce((sum, order) => sum + order.total_amount, 0);
                
                setRecentOrders(foodOrders.slice(0, 3) as Order[]);
                setStats(prev => ({ ...prev, revenue: totalRevenue, orders: foodOrders.length }));
            }

            setLoading(false);
        };
        fetchData();
    }, [user, supabase]);
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Food Mess Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ChefHat className="text-primary"/> Recent Orders</CardTitle>
                        <CardDescription>A snapshot of your latest food orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="animate-spin" /> : recentOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.buyer?.full_name || 'N/A'}</TableCell>
                                            <TableCell>{order.order_items.map(oi => oi.products?.name || 'Unknown Item').join(', ')}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'Ready' ? 'default' : order.status === 'Pending' ? 'destructive' : 'secondary'}>
                                                    {order.status || 'Pending'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <p className="text-muted-foreground text-center py-10">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>

                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IndianRupee className="text-primary"/> Total Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {loading ? <Loader2 className="animate-spin" /> : <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>}
                            <p className="text-sm text-muted-foreground">from {stats.orders} orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Subscriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-muted-foreground text-center py-4">Subscription feature coming soon!</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Utensils className="text-primary"/> Menu Management</CardTitle>
                        <CardDescription>Update your daily menu and prices.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/marketplace/new">
                            <PlusCircle className="mr-2"/> Add Item
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? <Loader2 className="animate-spin" /> : menuItems.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dish Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>₹{item.price}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/vendor/products/${item.id}/edit`}>Edit</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <p className="text-muted-foreground text-center py-10">No menu items found. <Link href="/marketplace/new" className="text-primary underline">Add one now</Link>.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
