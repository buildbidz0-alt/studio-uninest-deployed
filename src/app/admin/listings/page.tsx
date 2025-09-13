
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Product, Profile } from "@/lib/types";

// Explicitly define the types for clarity
type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'email'> | null;
};


export default async function AdminListingsPage() {
    const supabase = createClient();
    
    // 1. Fetch all products and all profiles in parallel
    const [productsRes, profilesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('profiles').select('id, full_name, email')
    ]);

    const products = productsRes.data || [];
    const profiles = profilesRes.data || [];

    // Create a quick-access map for profiles
    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    // 2. Manually join the data in code for robustness
    const listings: ProductWithProfile[] = products.map(product => ({
        ...product,
        profiles: profilesMap.get(product.seller_id) || null,
    }));


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
                            {listings && listings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No listings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listings?.map(listing => (
                                    <TableRow key={listing.id}>
                                        <TableCell className="font-medium">{listing.name}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{listing.profiles?.full_name || 'N/A'}</div>
                                            <div className="text-sm text-muted-foreground">{listing.profiles?.email || 'No email'}</div>
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
