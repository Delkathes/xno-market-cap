'use client'

import type { PieLabelRenderProps } from 'recharts'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketDataError } from '@/components/market-data-error'

const SLICE_COLORS: Record<string, string> = {
	XNO: '#209CE9',
	BTC: '#F7931A',
	ETH: '#9357F4',
	XRP: '#23292F',
	BNB: '#F3BA2F',
	SOL: '#9945FF',
	Others: '#666666',
}

export function DominanceChart() {
	const { data, isLoading, error } = useMarketData()

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

	if (error || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Market Dominance</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	const xno = data.find((c) => c.id === 'nano')
	const xnoPrice = xno?.current_price || 1
	const totalMarketCapXNO = data.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

	// Get top 5 by market cap (excluding XNO)
	const top5 = [...data]
		.filter((c) => c.id !== 'nano')
		.sort((a, b) => b.market_cap - a.market_cap)
		.slice(0, 5)

	const xnoMarketCapXNO = xno ? xno.market_cap / xnoPrice : 0

	// Calculate "Others" - everything except XNO and top 5
	const top5Ids = new Set(top5.map((c) => c.id))
	const othersValue = data
		.filter((c) => c.id !== 'nano' && !top5Ids.has(c.id))
		.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

	const chartData = [
		{
			name: 'XNO',
			value: xnoMarketCapXNO,
			percentage: ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4),
		},
		...top5.map((crypto) => {
			const marketCapXNO = crypto.market_cap / xnoPrice
			return {
				name: crypto.symbol.toUpperCase(),
				value: marketCapXNO,
				percentage: ((marketCapXNO / totalMarketCapXNO) * 100).toFixed(2),
			}
		}),
		{
			name: 'Others',
			value: othersValue,
			percentage: ((othersValue / totalMarketCapXNO) * 100).toFixed(2),
		},
	]

	const xnoDominance = ((xnoMarketCapXNO / totalMarketCapXNO) * 100).toFixed(4)

	return (
		<Card>
			<CardHeader className="pb-0">
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
							label={(props: PieLabelRenderProps) => {
								const { x, y, textAnchor, payload, percent, index } = props

								if (x === undefined || y === undefined || !payload) {
									return null
								}

								const name = String(payload.name ?? '')

								// Hide percentage for slices at index 3, 4, 5 (top 3-5 cryptos) to avoid overlap
								// Index: 0=XNO, 1=BTC, 2=ETH, 3=XRP, 4=BNB, 5=SOL, 6=Others
								const hidePercentage = index !== undefined && index >= 3 && index <= 5

								const percentage =
									typeof payload.percentage === 'string'
										? payload.percentage
										: percent !== undefined
											? (percent * 100).toFixed(2)
											: '0.00'

								return (
									<text
										x={x}
										y={y}
										fill="var(--foreground)"
										textAnchor={textAnchor ?? 'middle'}
										dominantBaseline="central"
										className="text-xs font-medium"
									>
										{hidePercentage ? name : `${name} ${percentage}%`}
									</text>
								)
							}}
							outerRadius={120}
							fill="#8884d8"
							dataKey="value"
						>
							{chartData.map((entry) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={SLICE_COLORS[entry.name] ?? 'hsl(var(--chart-1))'}
								/>
							))}
						</Pie>
						<Tooltip
							formatter={(value: number) => [
								value >= 1e9 ? `${(value / 1e9).toFixed(2)}B XNO` : `${(value / 1e6).toFixed(2)}M XNO`,
								'Market Cap',
							]}
						/>
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
