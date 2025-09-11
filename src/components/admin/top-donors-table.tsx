
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';

export default async function TopDonorsTable() {
    const supabase = createClient();
    // This is an example of how you might fetch top donors.
    // It assumes a 'donations' table and sums amounts by user.
    // This could be slow on large tables; a database function (RPC) would be more performant.
    const { data: topDonors, error } = await supabase
        .from('donations')
        .select(`
            amount,
            profiles (
                full_name,
                email,
                avatar_url
            )
        `)
        .order('amount', { ascending: false })
        .limit(5);

    // Manual aggregation in JS
    const aggregatedDonors = topDonors?.reduce((acc: any[], current) => {
        if (!current.profiles) return acc;
        const existing = acc.find(d => d.email === current.profiles!.email);
        if (existing) {
            existing.total += current.amount;
        } else {
            acc.push({
                name: current.profiles.full_name,
                email: current.profiles.email,
                avatar: current.profiles.avatar_url,
                total: current.amount
            });
        }
        return acc;
    }, []).sort((a,b) => b.total - a.total).slice(0, 5);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Donors</CardTitle>
        <CardDescription>Our most generous supporters this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Total Donated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggregatedDonors && aggregatedDonors.length > 0 ? (
                aggregatedDonors.map((donor) => (
                <TableRow key={donor.email}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={donor.avatar} alt="Avatar" data-ai-hint="person face" />
                        <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                        <p className="font-medium leading-none">{donor.name}</p>
                        <p className="text-xs text-muted-foreground">{donor.email}</p>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{donor.total.toLocaleString()}</TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                        No donor data available.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
