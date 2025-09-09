
import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

type Payment = {
    id: string;
    amount: number;
    currency: string;
    type: 'Donation' | 'Competition Entry';
    created_at: string;
    user: {
        full_name: string | null;
        email: string | null;
    } | null;
}

export default async function AdminPaymentsPage() {
    const supabase = createClient();
    
    const { data: donations } = await supabase.from('donations').select('*, profiles(full_name, email)');
    const { data: competitionEntries } = await supabase.from('competition_entries').select('*, profiles(full_name, email), competitions(title, entry_fee)');

    const payments: Payment[] = [
        ...(donations || []).map(d => ({
            id: d.razorpay_payment_id || `donation-${d.id}`,
            amount: d.amount,
            currency: d.currency,
            type: 'Donation',
            created_at: d.created_at,
            user: d.profiles ? { full_name: d.profiles.full_name, email: d.profiles.email } : {full_name: 'Anonymous', email: null}
        })),
        ...(competitionEntries || []).map(c => ({
            id: c.razorpay_payment_id || `comp-${c.id}`,
            amount: c.competitions?.entry_fee || 0,
            currency: 'INR',
            type: 'Competition Entry',
            created_at: c.created_at,
            user: c.profiles ? { full_name: c.profiles.full_name, email: c.profiles.email } : {full_name: 'Anonymous', email: null}
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    return (
        <div className="space-y-8">
            <PageHeader title="Payment History" description="View and manage all transactions." />
             <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.user?.full_name}</div>
                                            <div className="text-sm text-muted-foreground">{payment.user?.email}</div>
                                        </TableCell>
                                        <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={payment.type === 'Donation' ? 'default' : 'secondary'}>
                                                {payment.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(payment.created_at), 'Pp')}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="default" className="bg-green-600">Success</Badge>
                                        </TableCell>
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
