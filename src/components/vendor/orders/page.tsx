
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { Order } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function VendorOrdersContent() {
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            products ( name )
          ),
          buyer:profiles!buyer_id (
            id, full_name, avatar_url
          )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, supabase]);

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
              {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No orders found yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
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
                        {/* Status logic can be added later */}
                        <Badge>Completed</Badge>
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
