
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Computer, IndianRupee, Clock, PlusCircle, Gamepad2, Printer, Check, X, Calendar } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock data, replace with actual data from your backend
const systemStats = {
    total: 25,
    available: 10,
    inUse: 15,
};

const systems = Array.from({ length: systemStats.total }, (_, i) => ({
  id: `PC-${String(i + 1).padStart(2, '0')}`,
  status: i < systemStats.inUse ? 'in-use' : 'available',
  user: i < systemStats.inUse ? 'Rohan V.' : null,
  startTime: i < systemStats.inUse ? Date.now() - Math.random() * 2 * 3600 * 1000 : null,
}));

const usageData = [
  { time: '10 AM', users: 5 }, { time: '11 AM', users: 8 },
  { time: '12 PM', users: 12 }, { time: '1 PM', users: 15 },
  { time: '2 PM', users: 14 }, { time: '3 PM', users: 18 },
  { time: '4 PM', users: 22 }, { time: '5 PM', users: 20 },
  { time: '6 PM', users: 16 },
];

const ratePlans = [
    { name: 'Standard Usage', price: '₹30/hr', icon: Computer },
    { name: 'Gaming Zone', price: '₹50/hr', icon: Gamepad2 },
    { name: 'Printing/Scanning', price: '₹5/page', icon: Printer },
]

export default function CybercafeDashboard() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Cybercafé Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Available Systems</CardTitle>
                        <Check className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{systemStats.available}</p>
                        <p className="text-sm text-muted-foreground">out of {systemStats.total} total</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Systems In Use</CardTitle>
                        <X className="text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{systemStats.inUse}</p>
                         <p className="text-sm text-muted-foreground">currently active sessions</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Today's Revenue</CardTitle>
                        <IndianRupee className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹4,500</p>
                         <p className="text-sm text-muted-foreground">from active sessions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Computer className="text-primary"/> Live System Status</CardTitle>
                        <CardDescription>Overview of all systems and their current status.</CardDescription>
                    </div>
                     <Button variant="outline"><Calendar className="mr-2"/> Manage Bookings</Button>
                </CardHeader>
                <CardContent className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                    {systems.map(system => (
                        <div key={system.id} className={cn(
                            "p-3 rounded-lg border-2 text-center",
                            system.status === 'in-use' ? 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800' : 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800'
                        )}>
                            <p className="font-bold">{system.id}</p>
                            <Badge variant={system.status === 'in-use' ? 'destructive' : 'default'} className="capitalize mt-1">{system.status}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Usage Hours</CardTitle>
                        <CardDescription>Identify when your café is busiest.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={usageData}>
                                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))' 
                                    }}
                                />
                                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Rate Plans</CardTitle>
                        <CardDescription>Manage your service pricing.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {ratePlans.map(plan => (
                            <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div className="flex items-center gap-3">
                                    <plan.icon className="size-5 text-primary"/>
                                    <span className="font-semibold">{plan.name}</span>
                                </div>
                                <span className="font-bold">{plan.price}</span>
                            </div>
                        ))}
                         <Button className="w-full"><PlusCircle className="mr-2"/> Add New Plan</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
