
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import ChartCard from "../chart-card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Mock Data - Replace with API call to /admin/analytics/listings/counts
const chartData = [
  { name: "Books", value: 120, fill: "var(--color-books)" },
  { name: "Hostels", value: 45, fill: "var(--color-hostels)" },
  { name: "Food Mess", value: 80, fill: "var(--color-food)" },
  { name: "Cyber Café", value: 30, fill: "var(--color-cyber)" },
  { name: "Other", value: 177, fill: "var(--color-other)" },
]

const chartConfig = {
  count: {
    label: "Listings",
  },
  books: {
    label: "Books",
    color: "hsl(var(--chart-1))",
  },
  hostels: {
    label: "Hostels",
    color: "hsl(var(--chart-2))",
  },
  food: {
    label: "Food Mess",
    color: "hsl(var(--chart-3))",
  },
  cyber: {
    label: "Cyber Café",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function ListingsByCategoryChart() {
  return (
    <ChartCard 
        title="Listings by Category"
        description="Distribution of active marketplace listings."
        className="flex flex-col h-full"
    >
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
        >
            <PieChart>
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-[20px] flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    </ChartCard>
  )
}
