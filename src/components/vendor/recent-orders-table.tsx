import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const recentOrders = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00", avatar: "https://picsum.photos/seed/u1/40/40" },
    { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00", avatar: "https://picsum.photos/seed/u2/40/40" },
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00", avatar: "https://picsum.photos/seed/u3/40/40" },
    { name: "William Kim", email: "will@email.com", amount: "+$99.00", avatar: "https://picsum.photos/seed/u4/40/40" },
    { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00", avatar: "https://picsum.photos/seed/u5/40/40" },
]

export default function RecentOrdersTable() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>You made 265 sales this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {recentOrders.map(order => (
                 <div key={order.email} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={order.avatar} alt="Avatar" data-ai-hint="person face" />
                    <AvatarFallback>{order.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {order.email}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">{order.amount}</div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
