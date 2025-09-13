
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AdminInternshipsPage() {
    const supabase = createClient();
    const { data: internships, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="Internships" description="Manage all internship listings.">
                 <Button asChild>
                    <Link href="/admin/internships/new">
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
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Stipend</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {internships && internships.length > 0 ? (
                                internships.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.role}</TableCell>
                                        <TableCell>{item.company}</TableCell>
                                        <TableCell>
                                            {item.stipend > 0 ? `₹${item.stipend.toLocaleString()}` : <Badge variant="secondary">Unpaid</Badge>}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{item.location}</Badge></TableCell>
                                        <TableCell>{format(new Date(item.deadline), 'PPP')}</TableCell>
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
                                    <TableCell colSpan={6} className="text-center h-24">No internships found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
