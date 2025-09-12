
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Utensils, PlusCircle, Users, IndianRupee, ChefHat, Drumstick, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data, replace with actual data from your backend
const liveOrderStats = {
    pending: 5,
    cooking: 8,
    ready: 3,
    total: 16,
};

const recentOrders = [
    { id: 1, customer: 'Ananya Sharma', items: ['Thali', 'Extra Roti'], status: 'Cooking' },
    { id: 2, customer: 'Rohan Verma', items: ['Special Thali'], status: 'Pending' },
    { id: 3, customer: 'Priya Singh', items: ['Paratha', 'Coke'], status: 'Ready' },
];

const subscriptionStats = {
    daily: 45,
    weekly: 120,
    monthly: 85,
};

const menuItems = [
    { id: 1, name: 'Standard Thali', price: 80, isVeg: true },
    { id: 2, name: 'Special Thali', price: 120, isVeg: true },
    { id: 3, name: 'Chicken Curry', price: 150, isVeg: false },
]

export default function FoodMessDashboard() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Food Mess Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ChefHat className="text-primary"/> Live Orders</CardTitle>
                        <CardDescription>Track incoming orders in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{liveOrderStats.pending}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold">{liveOrderStats.cooking}</p>
                                <p className="text-sm text-muted-foreground">Cooking</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-green-500">{liveOrderStats.ready}</p>
                                <p className="text-sm text-muted-foreground">Ready</p>
                            </div>
                        </div>
                        <Progress value={(liveOrderStats.ready / liveOrderStats.total) * 100} className="mt-4 h-2" />
                        <Table className="mt-4">
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
                                        <TableCell className="font-medium">{order.customer}</TableCell>
                                        <TableCell>{order.items.join(', ')}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'Ready' ? 'default' : order.status === 'Pending' ? 'destructive' : 'secondary'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IndianRupee className="text-primary"/> Today's Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">₹8,450</p>
                            <p className="text-sm text-muted-foreground">+15% from yesterday</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Subscriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Daily</span>
                                <span className="font-bold">{subscriptionStats.daily}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Weekly</span>
                                <span className="font-bold">{subscriptionStats.weekly}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Monthly</span>
                                <span className="font-bold">{subscriptionStats.monthly}</span>
                             </div>
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
                    <Button><PlusCircle className="mr-2"/> Add Item</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dish Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        {item.isVeg ? <Leaf className="size-5 text-green-600" /> : <Drumstick className="size-5 text-red-600" />}
                                    </TableCell>
                                    <TableCell>₹{item.price}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
