
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Product, Profile } from "@/lib/types";
import Link from 'next/link';

// Explicitly define the types for clarity
type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'handle'> | null;
};


export default async function AdminListingsPage() {
    const supabase = createClient();
    
    // Use a direct join in the query for efficiency
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            profiles:seller_id (
                full_name,
                handle
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader title="Listing Management" description="Error loading marketplace listings." />
                <p>Could not fetch data: {error.message}</p>
            </div>
        )
    }

    const listings: ProductWithProfile[] = (data as any) || [];

    return (
        <div className="space-y-8">
            <PageHeader title="Listing Management" description="Manage all marketplace listings." />
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
                                            {/* Future actions can go here */}
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
