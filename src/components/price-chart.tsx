'use client'

import { useMemo, useState } from 'react'
import { AreaChartIcon, LineChartIcon, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { ChartTimeRange } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'
import { usePriceChart } from '@/hooks/use-price-chart'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PriceChartProps {
	coinId: string
}

type ChartType = 'area' | 'line'

const TIME_RANGES: { value: ChartTimeRange; label: string }[] = [
	{ value: '1', label: '24H' },
	{ value: '7', label: '7D' },
	{ value: '30', label: '30D' },
	{ value: '90', label: '90D' },
	{ value: '365', label: '1Y' },
]

// Theme-aware colors for charts
const CHART_COLORS = {
	light: {
		constructive: '#22c55e', // green-500
		destructive: '#ef4444', // red-500
		muted: '#64748b', // slate-500
	},
	dark: {
		constructive: '#4ade80', // green-400
		destructive: '#f87171', // red-400
		muted: '#94a3b8', // slate-400
	},
} as const

function formatXAxis(timestamp: number, timeRange: ChartTimeRange): string {
	const date = new Date(timestamp)
	if (timeRange === '1') {
		return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
	}
	if (timeRange === '7' || timeRange === '30') {
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
	}
	return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

function formatPrice(value: number): string {
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(2)}M`
	}
	if (value >= 1000) {
		return `${(value / 1000).toFixed(2)}K`
	}
	if (value >= 1) {
		return value.toFixed(2)
	}
	return value.toFixed(6)
}

interface ChartDataPoint {
	timestamp: number
	priceInXNO: number
}

interface CustomTooltipProps {
	active?: boolean
	payload?: { value: number; payload: ChartDataPoint }[]
	label?: number
	t: ReturnType<typeof useTranslations<'priceChart'>>
}

function CustomTooltip({ active, payload, label, t: _t }: CustomTooltipProps) {
	if (!active || !payload || !payload.length || !label) return null

	const data = payload[0]
	const date = new Date(label)

	return (
		<div className="bg-popover border border-border rounded-lg shadow-lg p-3">
			<p className="text-xs text-muted-foreground mb-1">
				{date.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}
			</p>
			<p className="text-sm font-medium text-primary">{data.value.toLocaleString()} XNO</p>
		</div>
	)
}

export function PriceChart({ coinId }: PriceChartProps) {
	const t = useTranslations('priceChart')

	const { resolvedTheme } = useTheme()

	const [timeRange, setTimeRange] = useState<ChartTimeRange>('30')
	const [chartType, setChartType] = useState<ChartType>('area')
	// const [mounted, setMounted] = useState(false)

	const { data } = useMarketData()
	const coin = data?.find((c) => c.id === coinId)
	const coinName = coin?.name ?? coinId.charAt(0).toUpperCase() + coinId.slice(1)

	const { prices, isLoading, isFetching, error } = usePriceChart(coinId, timeRange)

	// Ensure we're mounted before rendering theme-dependent content
	// useEffect(() => {
	// 	setMounted(true)
	// }, [])

	// Use the pre-calculated priceInXNO from the API (uses historical XNO prices)
	const chartData: ChartDataPoint[] = useMemo(() => {
		if (!prices.length) return []

		return prices.map((point) => ({
			timestamp: point.timestamp,
			priceInXNO: point.priceInXNO,
		}))
	}, [prices])

	// Calculate price change for the period
	const priceChange = useMemo(() => {
		if (chartData.length < 2) return { value: 0, percentage: 0 }
		const first = chartData[0].priceInXNO
		const last = chartData[chartData.length - 1].priceInXNO
		const change = last - first
		const percentage = (change / first) * 100
		return { value: change, percentage }
	}, [chartData])

	const isPositive = priceChange.percentage >= 0

	// Get theme-aware colors
	const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light
	const chartColor = isPositive ? colors.constructive : colors.destructive
	const axisColor = colors.muted

	// // Don't render chart until mounted to avoid hydration mismatch
	// if (!mounted) {
	// 	return (
	// 		<Card>
	// 			<CardHeader className="pb-2">
	// 				<Skeleton className="h-6 w-48" />
	// 				<div className="mt-4">
	// 					<Skeleton className="h-8 w-32" />
	// 				</div>
	// 			</CardHeader>
	// 			<CardContent className="pt-4">
	// 				<Skeleton className="h-75 w-full" />
	// 			</CardContent>
	// 		</Card>
	// 	)
	// }

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>{t('errorLoading')}</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3">
						<CardTitle className="text-lg">{t('title', { coin: coinName })}</CardTitle>
						{isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={chartType === 'area' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setChartType('area')}
							className="h-8 w-8 p-0"
							title={t('areaChart')}
						>
							<AreaChartIcon className="h-4 w-4" />
						</Button>
						<Button
							variant={chartType === 'line' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setChartType('line')}
							className="h-8 w-8 p-0"
							title={t('lineChart')}
						>
							<LineChartIcon className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
					{isLoading ? (
						<Skeleton className="h-8 w-48" />
					) : (
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold text-primary">
								{(chartData[chartData.length - 1]?.priceInXNO ?? 0).toLocaleString()} XNO
							</span>
							<span
								className={cn(
									'text-sm font-medium',
									isPositive ? 'text-constructive' : 'text-destructive',
								)}
							>
								{isPositive ? '+' : ''}
								{priceChange.percentage.toFixed(2)}%
							</span>
						</div>
					)}

					<Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as ChartTimeRange)}>
						<TabsList className="h-8">
							{TIME_RANGES.map((range) => (
								<TabsTrigger key={range.value} value={range.value} className="text-xs px-2 py-1">
									{range.label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>

			<CardContent className="pb-4 px-4">
				{isLoading ? (
					<Skeleton className="h-75 w-full" />
				) : (
					<ResponsiveContainer width="100%" height={300}>
						{chartType === 'area' ? (
							<AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
								<defs>
									<linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
										<stop offset="95%" stopColor={chartColor} stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey="timestamp"
									tickFormatter={(ts) => formatXAxis(ts, timeRange)}
									stroke={axisColor}
									fontSize={11}
									tickLine={false}
									axisLine={false}
									minTickGap={30}
								/>
								<YAxis
									domain={['auto', 'auto']}
									tickFormatter={formatPrice}
									stroke={axisColor}
									fontSize={11}
									tickLine={false}
									axisLine={false}
									width={60}
								/>
								<Tooltip content={<CustomTooltip t={t} />} />
								<Area
									type="monotone"
									dataKey="priceInXNO"
									stroke={chartColor}
									strokeWidth={2}
									fill="url(#priceGradient)"
								/>
							</AreaChart>
						) : (
							<LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
								<XAxis
									dataKey="timestamp"
									tickFormatter={(ts) => formatXAxis(ts, timeRange)}
									stroke={axisColor}
									fontSize={11}
									tickLine={false}
									axisLine={false}
									minTickGap={30}
								/>
								<YAxis
									domain={['auto', 'auto']}
									tickFormatter={formatPrice}
									stroke={axisColor}
									fontSize={11}
									tickLine={false}
									axisLine={false}
									width={60}
								/>
								<Tooltip content={<CustomTooltip t={t} />} />
								<Line
									type="monotone"
									dataKey="priceInXNO"
									stroke={chartColor}
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						)}
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	)
}
