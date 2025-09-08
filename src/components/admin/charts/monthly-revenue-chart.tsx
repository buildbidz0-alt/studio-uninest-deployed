
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartCard from '../chart-card';

// Mock Data - Replace with API call to /admin/analytics/revenue/monthly
const data = [
  { name: 'Jan', revenue: 2400 },
  { name: 'Feb', revenue: 1398 },
  { name: 'Mar', revenue: 9800 },
  { name: 'Apr', revenue: 3908 },
  { name: 'May', revenue: 4800 },
  { name: 'Jun', revenue: 3800 },
  { name: 'Jul', revenue: 4300 },
];

export default function MonthlyRevenueChart() {
  return (
    <ChartCard 
        title="Monthly Revenue" 
        description="Showing revenue for the last 7 months."
        contentClassName="pl-2"
    >
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
    </ChartCard>
  );
}
