
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Order = {
    id: string;
    amount: string;
    buyer: {
        name: string;
        email: string;
        avatar_url: string;
    }
}

type RecentOrdersTableProps = {
    orders: Order[];
    loading: boolean;
}

export default function RecentOrdersTable({ orders, loading }: RecentOrdersTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
            {loading ? 'Loading...' : orders.length > 0 ? `You have ${orders.length} orders this month.` : 'You have no sales this month.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {loading ? (
                <div className="text-center text-muted-foreground py-10">Loading orders...</div>
            ) : orders.length > 0 ? orders.map(order => (
                 <div key={order.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={order.buyer.avatar_url} alt="Avatar" data-ai-hint="person face" />
                    <AvatarFallback>{order.buyer.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {order.buyer.email}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">{order.amount}</div>
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

    