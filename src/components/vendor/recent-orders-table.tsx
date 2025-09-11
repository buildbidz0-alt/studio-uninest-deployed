
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type RecentOrdersTableProps = {
    orders: Order[];
    loading: boolean;
}

export default function RecentOrdersTable({ orders, loading }: RecentOrdersTableProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
            {loading ? 'Loading...' : orders.length > 0 ? `You have ${orders.length} recent orders.` : 'You have no sales yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {loading ? (
                <div className="text-center text-muted-foreground py-10">Loading orders...</div>
            ) : orders.length > 0 ? orders.map(order => (
                 <div key={order.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={order.buyer.avatar_url || ''} alt="Avatar" data-ai-hint="person face" />
                    <AvatarFallback>{order.buyer.full_name ? order.buyer.full_name.split(' ').map((n: string) => n[0]).join('') : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.buyer.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">+₹{order.total_amount.toLocaleString()}</div>
                </div>
            )) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No recent orders to display.</p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
