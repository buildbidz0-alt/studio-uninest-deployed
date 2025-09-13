
import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TicketStatusChanger from "@/components/admin/tickets/ticket-status-changer";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Force dynamic rendering

export default async function AdminTicketsPage() {
    const supabase = createClient();
    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select(`
            id,
            created_at,
            subject,
            category,
            status,
            priority,
            screenshot_url,
            profiles:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return <div>Error loading tickets: {error.message}</div>
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Support Tickets" description="Review and manage user feedback and issues." />
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Screenshot</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!tickets || tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No support tickets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={ticket.profiles?.avatar_url || undefined} alt={ticket.profiles?.full_name || 'User'} />
                                                    <AvatarFallback>{ticket.profiles?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{ticket.profiles?.full_name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                                        <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                                        <TableCell>
                                            {ticket.screenshot_url ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={ticket.screenshot_url} target="_blank" rel="noopener noreferrer">
                                                        View <ExternalLink className="ml-2 size-3" />
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(new Date(ticket.created_at), 'PPP')}</TableCell>
                                        <TableCell>
                                            <TicketStatusChanger ticketId={ticket.id} currentStatus={ticket.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
