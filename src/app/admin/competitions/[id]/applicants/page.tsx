
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function CompetitionApplicantsPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { data: competition } = await supabase
        .from('competitions')
        .select('title')
        .eq('id', params.id)
        .single();
    
    if (!competition) {
        notFound();
    }

    const { data: entries, error } = await supabase
        .from('competition_entries')
        .select(`
            id,
            created_at,
            razorpay_payment_id,
            profiles!inner (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('competition_id', params.id)
        .order('created_at', { ascending: false });

    if (error) {
        return <p>Error loading entrants: {error.message}</p>
    }

    return (
        <div className="space-y-8">
            <PageHeader title={`Entrants for ${competition.title}`} description="All users who have entered this competition." />

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Entered On</TableHead>
                                <TableHead>Payment ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No one has entered this competition yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={(entry.profiles as any)?.avatar_url || ''} />
                                                    <AvatarFallback>{(entry.profiles as any)?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{(entry.profiles as any)?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{(entry.profiles as any)?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(entry.created_at), 'PPP')}</TableCell>
                                        <TableCell className="font-mono text-xs">{entry.razorpay_payment_id || 'N/A (Free Entry)'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
