
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartCard from '../chart-card';

// TODO: Fetch data from your API, e.g. /admin/analytics/revenue/monthly
const data: any[] = [];

export default function MonthlyRevenueChart() {
  return (
    <ChartCard 
        title="Monthly Revenue" 
        description={data.length > 0 ? "Showing revenue for the last 7 months." : "No revenue data available for the last 7 months."}
        contentClassName="pl-2"
    >
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
                No data available
            </div>
        )}
    </ChartCard>
  );
}
