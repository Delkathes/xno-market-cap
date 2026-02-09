'use client'

import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { AreaChartIcon, ArrowRightLeft, LineChartIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
	Area,
	AreaChart,
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { formatPrice } from '@/lib/currency-helpers'
import type { ChartTimeRange, FiatCurrencyCode } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'
import { usePriceChart } from '@/hooks/use-price-chart'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingArea } from '@/components/loading-area'

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

interface ChartDataPoint {
	timestamp: number
	priceInXNO: number
}

interface CustomTooltipProps {
	active?: boolean
	payload?: { value: number; payload: ChartDataPoint }[]
	label?: number
	t: ReturnType<typeof useTranslations<'priceChart'>>
	quoteCurrency: string
}

function CustomTooltip({ active, payload, label, quoteCurrency }: CustomTooltipProps) {
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
			<p className="text-sm font-medium text-primary">
				{formatPrice(data.value)} {quoteCurrency}
			</p>
		</div>
	)
}

export function PriceChart({ coinId }: PriceChartProps) {
	const t = useTranslations('priceChart')

	const { resolvedTheme } = useTheme()

	// For XNO, use fiat currency; for other coins, compare against XNO
	const isXnoChart = coinId === CRYPTO_IDS.NANO
	const preferredFiat = useAtomValue(primaryFiatAtom)

	const [timeRange, setTimeRange] = useState<ChartTimeRange>('30')
	const [chartType, setChartType] = useState<ChartType>('area')
	const [inverted, setInverted] = useState(false)
	const [selectedFiat, setSelectedFiat] = useState<FiatCurrencyCode>(preferredFiat.toLowerCase() as FiatCurrencyCode)
	const [referenceLines, setReferenceLines] = useState<{
		start: boolean
		end: boolean
		min: boolean
		max: boolean
	}>({
		start: false,
		end: false,
		min: false,
		max: false,
	})

	const { data } = useMarketData()
	const coin = data?.find((c) => c.id === coinId)

	// For XNO, pass the selected fiat currency; for others, no vsCurrency (uses XNO comparison)
	const { prices, isLoading, error } = usePriceChart(coinId, timeRange, isXnoChart ? selectedFiat : undefined)

	// Use the pre-calculated priceInXNO from the API (uses historical XNO prices)
	// When inverted, show XNO/COIN instead of COIN/XNO (or FIAT/XNO instead of XNO/FIAT)
	const chartData: ChartDataPoint[] = useMemo(() => {
		if (!prices.length) return []

		return prices.map((point) => ({
			timestamp: point.timestamp,
			priceInXNO: inverted ? 1 / point.priceInXNO : point.priceInXNO,
		}))
	}, [prices, inverted])

	// Quote currency label changes based on inverted state and whether it's XNO fiat chart
	const fiatSymbol = selectedFiat.toUpperCase()
	const quoteCurrency = isXnoChart
		? inverted
			? 'XNO'
			: fiatSymbol
		: inverted
			? (coin?.symbol?.toUpperCase() ?? coinId.toUpperCase())
			: 'XNO'

	// Calculate price change for the period
	const priceChange = useMemo(() => {
		if (chartData.length < 2) return { value: 0, percentage: 0 }
		const first = chartData[0].priceInXNO
		const last = chartData[chartData.length - 1].priceInXNO
		const change = last - first
		const percentage = (change / first) * 100
		return { value: change, percentage }
	}, [chartData])

	// Calculate min/max for the period
	const priceStats = useMemo(() => {
		if (chartData.length === 0) return { start: 0, end: 0, min: 0, max: 0 }
		const prices = chartData.map((d) => d.priceInXNO)
		return {
			start: chartData[0].priceInXNO,
			end: chartData[chartData.length - 1].priceInXNO,
			min: Math.min(...prices),
			max: Math.max(...prices),
		}
	}, [chartData])

	const isPositive = priceChange.percentage >= 0

	// Get theme-aware colors
	const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light
	const chartColor = isPositive ? colors.constructive : colors.destructive
	const axisColor = colors.muted

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
		<div>
			<div className="mb-8">
				<div className="flex flex-row sm:items-center justify-between gap-4">
					<div className="flex gap-3 sm:items-center flex-wrap">
						<div className="relative">
							<CardDescription className="absolute -top-4.5 whitespace-nowrap">
								{inverted
									? t('titleInverted', { coin: coin?.symbol.toUpperCase() ?? '' })
									: t('title', { coin: coin?.symbol.toUpperCase() ?? '' })}
								{/* {t('title', { coin: coin?.symbol.toUpperCase() ?? '' })} */}
							</CardDescription>
							<div className="flex gap-3 sm:items-center">
								<CardTitle className="text-lg whitespace-nowrap uppercase">
									{isXnoChart
										? inverted
											? `${fiatSymbol}/XNO`
											: `XNO/${fiatSymbol}`
										: inverted
											? `XNO/${coin?.symbol}`
											: `${coin?.symbol}/XNO`}
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setInverted(!inverted)}
									className="h-8 w-8 p-0 cursor-pointer"
									title={t('invertChart')}
								>
									<ArrowRightLeft className="h-4 w-4" />
								</Button>
							</div>
						</div>
						{isXnoChart && (
							<Select value={selectedFiat} onValueChange={(v) => setSelectedFiat(v as FiatCurrencyCode)}>
								<SelectTrigger className="w-24 h-8 cursor-pointer">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(FiatCurrency).map(([key, value]) => (
										<SelectItem key={value} value={value.toLowerCase()}>
											{FIAT_CURRENCY_CONFIG[value as FiatCurrency].symbol} {key}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					<div className="flex gap-x-4 gap-y-2 flex-wrap items-end flex-col-reverse justify-end sm:flex-row sm:justify-end sm:flex-nowrap">
						<div className="flex items-center gap-1">
							<Button
								variant={referenceLines.start ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setReferenceLines((prev) => ({ ...prev, start: !prev.start }))}
								className="h-8 px-3 text-xs cursor-pointer"
							>
								Start
							</Button>
							<Button
								variant={referenceLines.end ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setReferenceLines((prev) => ({ ...prev, end: !prev.end }))}
								className="h-8 px-3 text-xs cursor-pointer"
							>
								End
							</Button>
							<Button
								variant={referenceLines.min ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setReferenceLines((prev) => ({ ...prev, min: !prev.min }))}
								className="h-8 px-3 text-xs text-destructive cursor-pointer"
							>
								Low
							</Button>
							<Button
								variant={referenceLines.max ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setReferenceLines((prev) => ({ ...prev, max: !prev.max }))}
								className="h-8 px-3 text-xs text-constructive cursor-pointer"
							>
								High
							</Button>
						</div>

						<div className="flex flex-nowrap items-center gap-2">
							<div className="flex items-center gap-2">
								<Button
									variant={chartType === 'line' ? 'secondary' : 'ghost'}
									size="sm"
									onClick={() => setChartType('line')}
									className="h-8 w-8 p-0 cursor-pointer"
									title={t('lineChart')}
								>
									<LineChartIcon className="h-4 w-4" />
								</Button>
								<Button
									variant={chartType === 'area' ? 'secondary' : 'ghost'}
									size="sm"
									onClick={() => setChartType('area')}
									className="h-8 w-8 p-0 cursor-pointer"
									title={t('areaChart')}
								>
									<AreaChartIcon className="h-4 w-4" />
								</Button>
							</div>

							<Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as ChartTimeRange)}>
								<TabsList className="h-8">
									{TIME_RANGES.map((range) => (
										<TabsTrigger
											key={range.value}
											value={range.value}
											className="text-xs px-2 py-1 cursor-pointer"
										>
											{range.label}
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
					{isLoading ? (
						<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl">
							<div className="h-9 w-full sm:w-80" />
							<div className="h-9 w-full sm:w-80" />
						</div>
					) : (
						<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl">
							<div className="flex gap-4 sm:gap-x-6">
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('start')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{formatPrice(priceStats.start)} {quoteCurrency}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('end')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{formatPrice(priceStats.end)} {quoteCurrency}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('change')}</span>
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
							</div>
							<div className="flex gap-4 sm:gap-6">
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('low')}</span>
									<span className="text-sm font-medium text-destructive">
										{formatPrice(priceStats.min)} {quoteCurrency}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('high')}</span>
									<span className="text-sm font-medium text-constructive">
										{formatPrice(priceStats.max)} {quoteCurrency}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('diff')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{formatPrice(priceStats.max - priceStats.min)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('spread')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{(((priceStats.max - priceStats.min) / priceStats.min) * 100).toFixed(2)}%
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div>
				{isLoading ? (
					<div className="h-75 w-full relative rounded-lg overflow-hidden">
						<LoadingArea />
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						{chartType === 'area' ? (
							<AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
								<Tooltip content={<CustomTooltip t={t} quoteCurrency={quoteCurrency} />} />
								{referenceLines.start && (
									<ReferenceLine
										y={priceStats.start}
										stroke={isPositive ? colors.constructive : colors.destructive}
										strokeWidth={1}
									/>
								)}
								{referenceLines.end && (
									<ReferenceLine
										y={priceStats.end}
										stroke={isPositive ? colors.constructive : colors.destructive}
										strokeWidth={1}
									/>
								)}
								{referenceLines.min && (
									<ReferenceLine
										y={priceStats.min}
										stroke={colors.destructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.max && (
									<ReferenceLine
										y={priceStats.max}
										stroke={colors.constructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.start && referenceLines.end && (
									<ReferenceArea
										y1={priceStats.start}
										y2={priceStats.end}
										fill={isPositive ? colors.constructive : colors.destructive}
										fillOpacity={0.1}
									/>
								)}
								<Area
									type="monotone"
									dataKey="priceInXNO"
									stroke={chartColor}
									strokeWidth={2}
									fill="url(#priceGradient)"
									animationDuration={750}
								/>
							</AreaChart>
						) : (
							<LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
								<Tooltip content={<CustomTooltip t={t} quoteCurrency={quoteCurrency} />} />
								{referenceLines.start && (
									<ReferenceLine
										y={priceStats.start}
										stroke={isPositive ? colors.constructive : colors.destructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.end && (
									<ReferenceLine
										y={priceStats.end}
										stroke={isPositive ? colors.constructive : colors.destructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.min && (
									<ReferenceLine
										y={priceStats.min}
										stroke={colors.destructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.max && (
									<ReferenceLine
										y={priceStats.max}
										stroke={colors.constructive}
										strokeDasharray="4 4"
										strokeWidth={1}
									/>
								)}
								{referenceLines.start && referenceLines.end && (
									<ReferenceArea
										y1={priceStats.start}
										y2={priceStats.end}
										fill={isPositive ? colors.constructive : colors.destructive}
										fillOpacity={0.1}
									/>
								)}
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
			</div>
		</div>
	)
}
