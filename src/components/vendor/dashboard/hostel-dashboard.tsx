
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, IndianRupee, Wrench, Calendar, PlusCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data, replace with actual data from your backend
const quickStats = {
    tenants: 88,
    revenue: 440000,
    maintenance: 3,
};

const rooms = [
    { id: 101, status: 'occupied', capacity: 2, tenants: ['Rohan', 'Arjun'] },
    { id: 102, status: 'available', capacity: 3, tenants: [] },
    { id: 103, status: 'maintenance', capacity: 2, tenants: [] },
    { id: 104, status: 'occupied', capacity: 2, tenants: ['Priya', 'Sana'] },
    { id: 201, status: 'available', capacity: 1, tenants: [] },
    { id: 202, status: 'occupied', capacity: 4, tenants: ['Amit', 'Kabir', 'Meera', 'Ravi'] },
];

const recentActivity = [
    { type: 'check-in', name: 'Kabir Ahmed', room: '202', date: '2 days ago' },
    { type: 'check-out', name: 'Vikram Singh', room: '101', date: '5 days ago' },
];

export default function HostelDashboard() {
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
                        <p className="text-3xl font-bold">{quickStats.tenants}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Monthly Revenue</CardTitle>
                        <IndianRupee className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{quickStats.revenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Maintenance</CardTitle>
                        <Wrench className="text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{quickStats.maintenance}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bed className="text-primary"/> Room Availability</CardTitle>
                        <CardDescription>Live overview of all hostel rooms.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Calendar className="mr-2"/> Manage Bookings</Button>
                        <Button><PlusCircle className="mr-2"/> Add Room</Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {rooms.map(room => (
                        <div key={room.id} className={cn(
                            "p-4 rounded-lg border-2",
                            room.status === 'occupied' && 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800',
                            room.status === 'available' && 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800',
                            room.status === 'maintenance' && 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800'
                        )}>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg">Room {room.id}</p>
                                <Badge variant="secondary" className="capitalize">{room.status}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                                <Users className="size-4"/>
                                <span>{room.tenants.length} / {room.capacity}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
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
                                <TableRow key={activity.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {activity.type === 'check-in' ? 
                                                <ArrowRight className="size-4 text-green-500"/> :
                                                <ArrowLeft className="size-4 text-red-500"/>
                                            }
                                            <span className="capitalize">{activity.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{activity.name}</TableCell>
                                    <TableCell>{activity.room}</TableCell>
                                    <TableCell>{activity.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
