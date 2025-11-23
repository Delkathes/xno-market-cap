"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useMarketData } from "@/hooks/use-market-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DominanceChart() {
  const { data, isLoading } = useMarketData()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Dominance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const xno = data?.find((c) => c.id === "nano")
  const xnoPrice = xno?.current_price || 1
  const totalMarketCapXNO = data?.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0

  const btc = data?.find((c) => c.id === "bitcoin")
  const eth = data?.find((c) => c.id === "ethereum")

  const xnoMarketCapXNO = xno ? xno.market_cap / xnoPrice : 0
  const btcMarketCapXNO = btc ? btc.market_cap / xnoPrice : 0
  const ethMarketCapXNO = eth ? eth.market_cap / xnoPrice : 0

  // Calculate "Others" - everything except XNO, BTC, ETH
  const othersValue =
    data
      ?.filter((c) => c.id !== "nano" && c.id !== "bitcoin" && c.id !== "ethereum")
      .reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0

  const chartData = [
    {
      name: "XNO",
      value: xnoMarketCapXNO,
      percentage: ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4),
    },
    {
      name: "BTC",
      value: btcMarketCapXNO,
      percentage: ((btcMarketCapXNO / totalMarketCapXNO) * 100).toFixed(2),
    },
    {
      name: "ETH",
      value: ethMarketCapXNO,
      percentage: ((ethMarketCapXNO / totalMarketCapXNO) * 100).toFixed(2),
    },
    {
      name: "Others",
      value: othersValue,
      percentage: ((othersValue / totalMarketCapXNO) * 100).toFixed(2),
    },
  ]

  const xnoDominance = ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Dominance Distribution</CardTitle>
        <CardDescription>Market share valued in XNO • XNO Dominance: {xnoDominance}%</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                value >= 1e9 ? `${(value / 1e9).toFixed(2)}B XNO` : `${(value / 1e6).toFixed(2)}M XNO`,
                "Market Cap",
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
