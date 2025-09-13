
'use client';

import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Order } from "@/lib/types";

type VendorOrdersContentProps = {
    initialOrders: Order[];
}

export default function VendorOrdersContent({ initialOrders }: VendorOrdersContentProps) {
  
  return (
    <div className="space-y-8">
      <PageHeader title="Customer Orders" description="View and manage all your sales." />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No orders found yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                           <AvatarImage src={order.buyer.avatar_url || undefined} />
                          <AvatarFallback>{order.buyer.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{order.buyer.full_name}</div>
                      </div>
                    </TableCell>
                     <TableCell>
                        {order.order_items.map(item => item.products.name).join(', ')}
                    </TableCell>
                    <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(order.created_at), 'PPP')}</TableCell>
                    <TableCell>
                        <Badge>{order.status || 'Completed'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
