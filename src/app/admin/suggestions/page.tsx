
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminSuggestionsPage() {
    const supabase = createClient();
    
    const { data: suggestions, error } = await supabase
        .from('suggestions')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="User Suggestions" description="Review competition and internship suggestions from users." />
             <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Submitted By</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!suggestions || suggestions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No suggestions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suggestions.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{format(new Date(item.created_at), 'PPP')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="size-7">
                                                    <AvatarImage src={(item.profiles as any)?.avatar_url} />
                                                    <AvatarFallback>{(item.profiles as any)?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                {(item.profiles as any)?.full_name || 'Anonymous'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-sm">{item.description}</p>
                                        </TableCell>
                                        <TableCell>{item.contact}</TableCell>
                                        <TableCell>{item.deadline ? format(new Date(item.deadline), 'PPP') : 'N/A'}</TableCell>
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
