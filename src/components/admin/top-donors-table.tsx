
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AggregatedDonor = {
  name: string;
  userId: string;
  avatar: string | null;
  total: number;
};

type TopDonorsTableProps = {
  donors: AggregatedDonor[];
};

export default function TopDonorsTable({ donors }: TopDonorsTableProps) {
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
            {donors && donors.length > 0 ? (
                donors.map((donor) => (
                <TableRow key={donor.userId}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={donor.avatar || ''} alt="Avatar" data-ai-hint="person face" />
                        <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                        <p className="font-medium leading-none">{donor.name}</p>
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
