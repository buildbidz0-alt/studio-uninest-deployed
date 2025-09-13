
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteInternship } from './actions';
import { useAuth } from '@/hooks/use-auth';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    location: string;
    deadline: string;
};

export default function AdminInternshipsPage() {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [productToDelete, setProductToDelete] = useState<Internship | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

     useState(() => {
        const fetchInternships = async () => {
            if (!supabase) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('internships')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setInternships(data);
            }
            setLoading(false);
        };
        fetchInternships();
    });

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        const result = await deleteInternship(productToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Internship deleted successfully.' });
            setInternships(internships.filter(c => c.id !== productToDelete.id));
            setProductToDelete(null);
        }
    };

    return (
        <>
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
                                                    <DropdownMenuItem disabled><Pencil className="mr-2 size-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(item)}>
                                                        <Trash2 className="mr-2 size-4" />Delete
                                                    </DropdownMenuItem>
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
        <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the internship listing.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Continue'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
