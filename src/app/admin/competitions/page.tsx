
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from "lucide-react";
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
import { deleteCompetition } from './actions';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

type Competition = {
    id: number;
    title: string;
    prize: number;
    entry_fee: number;
    deadline: string;
};

export default function AdminCompetitionsPage() {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [productToDelete, setProductToDelete] = useState<Competition | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        const fetchCompetitions = async () => {
            if (!supabase) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setCompetitions(data);
            }
            setLoading(false);
        };
        fetchCompetitions();
    }, [supabase]);

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        const result = await deleteCompetition(productToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Competition deleted successfully.' });
            setCompetitions(competitions.filter(c => c.id !== productToDelete.id));
            setProductToDelete(null);
        }
    };


    return (
        <>
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : competitions && competitions.length > 0 ? (
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
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/competitions/${comp.id}/edit`}>
                                                            <Pencil className="mr-2 size-4" />Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(comp)}>
                                                        <Trash2 className="mr-2 size-4" />Delete
                                                    </DropdownMenuItem>
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
         <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the competition and all associated entry data.
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
