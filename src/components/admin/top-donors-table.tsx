
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock Data - Replace with API call to /admin/analytics/top/donors
const topDonors = [
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', avatar: 'https://picsum.photos/seed/priya/100', total: 5000 },
  { name: 'David Chen', email: 'david.chen@example.com', avatar: 'https://picsum.photos/seed/david/100', total: 3000 },
  { name: 'Aisha Mohammed', email: 'aisha.m@example.com', avatar: 'https://picsum.photos/seed/aisha/100', total: 2500 },
  { name: 'Ravi Kumar', email: 'ravi.k@example.com', avatar: 'https://picsum.photos/seed/ravi/100', total: 1500 },
  { name: 'Emily White', email: 'emily.w@example.com', avatar: 'https://picsum.photos/seed/emily/100', total: 1000 },
];

export default function TopDonorsTable() {
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
            {topDonors.map((donor) => (
              <TableRow key={donor.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={donor.avatar} alt="Avatar" />
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
