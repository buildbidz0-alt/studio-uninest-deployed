
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Utensils, PlusCircle, Users, IndianRupee, ChefHat } from "lucide-react";
import Link from 'next/link';
import type { Product } from "@/lib/types";

type FoodMessDashboardProps = {
    products: Product[];
    orders: any[];
};

export default function FoodMessDashboard({ products, orders }: FoodMessDashboardProps) {
    const menuItems = products.filter(p => p.category === 'Food Mess');
    const recentOrders = orders.slice(0, 3);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
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
                        {recentOrders.length > 0 ? (
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
                                            <TableCell>{order.order_items.map((oi: any) => oi.products?.name || 'Unknown Item').join(', ')}</TableCell>
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
                            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">from {orders.length} orders</p>
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
                        <Link href="/vendor/products/new">
                            <PlusCircle className="mr-2"/> Add Menu Item
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {menuItems.length > 0 ? (
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
                         <p className="text-muted-foreground text-center py-10">No menu items found. <Link href="/vendor/products/new" className="text-primary underline">Add one now</Link>.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
