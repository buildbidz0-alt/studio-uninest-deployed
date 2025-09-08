
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Fetch recent orders from your API
const recentOrders: any[] = [];

export default function RecentOrdersTable() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
            {recentOrders.length > 0 ? `You have ${recentOrders.length} orders this month.` : 'You have no sales this month.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {recentOrders.length > 0 ? recentOrders.map(order => (
                 <div key={order.email} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={order.avatar} alt="Avatar" data-ai-hint="person face" />
                    <AvatarFallback>{order.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {order.email}
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
