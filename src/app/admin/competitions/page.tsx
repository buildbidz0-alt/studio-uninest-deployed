
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AdminCompetitionsPage() {
    const supabase = createClient();
    const { data: competitions, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="Competitions" description="Manage all competition listings.">
                 <Button asChild>
                    <Link href="/admin/competitions/new">
                        <PlusCircle className="mr-2 size-4" />
                        Add New
                    </Link>
                 </Button>
            </PageHeader>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Prize</TableHead>
                                <TableHead>Entry Fee</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competitions && competitions.length > 0 ? (
                                competitions.map(comp => (
                                    <TableRow key={comp.id}>
                                        <TableCell className="font-medium">{comp.title}</TableCell>
                                        <TableCell>₹{comp.prize.toLocaleString()}</TableCell>
                                        <TableCell>₹{comp.entry_fee.toLocaleString()}</TableCell>
                                        <TableCell>{format(new Date(comp.deadline), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                           <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No competitions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
