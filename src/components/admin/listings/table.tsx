
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Product, Profile } from "@/lib/types";
import Link from 'next/link';
import { MoreHorizontal, Trash2 } from "lucide-react";
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
import { deleteProductByAdmin } from '@/app/admin/listings/actions';

type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'handle'> | null;
};

type ListingsTableProps = {
    initialListings: ProductWithProfile[];
}

export default function ListingsTable({ initialListings }: ListingsTableProps) {
    const { toast } = useToast();
    const [listings, setListings] = useState(initialListings);
    const [itemToDelete, setItemToDelete] = useState<ProductWithProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const result = await deleteProductByAdmin(itemToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Listing removed successfully.' });
            setListings(listings.filter(l => l.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };
    
    return (
        <>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Listed On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No listings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listings.map(listing => (
                                    <TableRow key={listing.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/marketplace/${listing.id}`} className="hover:underline">
                                                {listing.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/profile/${listing.profiles?.handle}`} className="hover:underline">
                                                <div className="font-medium">{listing.profiles?.full_name || 'N/A'}</div>
                                                <div className="text-sm text-muted-foreground">@{listing.profiles?.handle || 'N/A'}</div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{listing.category}</Badge>
                                        </TableCell>
                                        <TableCell>₹{listing.price.toLocaleString()}</TableCell>
                                        <TableCell>{format(new Date(listing.created_at), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(listing)}>
                                                        <Trash2 className="mr-2 size-4" />Delete Listing
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove the listing from the marketplace. This action cannot be undone.
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
