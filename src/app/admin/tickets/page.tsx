'use client';

import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TicketStatusChanger from "@/components/admin/tickets/ticket-status-changer";
import Link from "next/link";
import type { SupportTicket, Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

type TicketWithProfile = SupportTicket & {
    profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTickets = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            
            const { data: ticketsData, error: fetchError } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    profiles (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

            if (fetchError) {
                setError(`Error loading tickets: ${fetchError.message}`);
            } else {
                setTickets((ticketsData as any) || []);
            }
            setLoading(false);
        };

        fetchTickets();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader title="Support Tickets" description="Review and manage user feedback and issues." />
                <p>{error}</p>
            </div>
        )
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
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!tickets || tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No support tickets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map(ticket => (
                                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
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
                                        <TableCell className="font-medium max-w-xs truncate">
                                            <Link href={`/admin/tickets/${ticket.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                                {ticket.subject}
                                            </Link>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                                        <TableCell>{format(new Date(ticket.created_at), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
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
