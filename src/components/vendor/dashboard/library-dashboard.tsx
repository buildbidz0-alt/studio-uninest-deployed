
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, Clock, PlusCircle, User, Users } from "lucide-react";
import Link from 'next/link';

// Mock data, replace with actual data from your backend
const liveBookingStatus = {
    totalSeats: 100,
    occupied: 67,
    available: 33,
    nextAvailable: '3:00 PM',
};

const recentBookings = [
    { id: 1, name: 'Ananya Sharma', seat: 'A12', time: '2:00 PM - 4:00 PM' },
    { id: 2, name: 'Rohan Verma', seat: 'C5', time: '2:30 PM - 5:00 PM' },
    { id: 3, name: 'Priya Singh', seat: 'B8', time: '1:00 PM - 3:00 PM' },
];

const catalogStats = {
    totalBooks: 5420,
    booksIssued: 312,
    overdue: 15,
};


export default function LibraryDashboard() {
    const occupiedPercentage = (liveBookingStatus.occupied / liveBookingStatus.totalSeats) * 100;
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Library Management</h2>
            
            {/* Live Booking & Catalog Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Live Booking Status</CardTitle>
                        <CardDescription>Real-time overview of library seat occupation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Occupied: {liveBookingStatus.occupied}</span>
                            <span>Available: {liveBookingStatus.available}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-4">
                            <div className="bg-primary h-4 rounded-full" style={{ width: `${occupiedPercentage}%` }}></div>
                        </div>
                         <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Total Seats: {liveBookingStatus.totalSeats}</span>
                            <span>Next Slot: {liveBookingStatus.nextAvailable}</span>
                        </div>
                         <Button className="w-full mt-4">Manage Bookings</Button>
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
                            <span className="font-bold">{catalogStats.totalBooks.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Books Issued</span>
                            <span className="font-bold">{catalogStats.booksIssued}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-red-500 font-bold">Overdue</span>
                            <span className="font-bold text-red-500">{catalogStats.overdue}</span>
                         </div>
                         <Button className="w-full mt-2" variant="outline">Manage Catalog</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Membership */}
            <div className="grid lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Recent Seat Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead>Time Slot</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.name}</TableCell>
                                        <TableCell>{booking.seat}</TableCell>
                                        <TableCell>{booking.time}</TableCell>
                                        <TableCell><CheckCircle className="size-5 text-green-500"/></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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

