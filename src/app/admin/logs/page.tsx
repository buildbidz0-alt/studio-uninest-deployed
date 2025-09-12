
import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminLogsPage() {
    const supabase = createClient();
    const { data: logs } = await supabase
        .from('audit_log')
        .select(`
            *,
            admin:admin_id (
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-8">
            <PageHeader title="Audit Logs" description="Track all administrative actions." />
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!logs || logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(new Date(log.created_at), 'Pp')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="size-7">
                                                    <AvatarImage src={log.admin?.avatar_url} />
                                                    <AvatarFallback>{log.admin?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                {log.admin?.full_name}
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="font-mono text-xs">{log.action}</span></TableCell>
                                        <TableCell className="font-mono text-xs max-w-sm truncate">{log.details}</TableCell>
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
