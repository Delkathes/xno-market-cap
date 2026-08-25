'use client'

import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { AreaChartIcon, ArrowRightLeft, LineChartIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import { formatLargeNumber } from '@/lib/currency-helpers'
import type { ChartTimeRange, FiatCurrencyCode } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'
import { usePriceChart } from '@/hooks/use-price-chart'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingArea } from '@/components/loading-area'

interface MarketCapVolumeChartProps {
	coinId: string
}

const TIME_RANGES: { value: ChartTimeRange; label: string }[] = [
	{ value: '1', label: '24H' },
	{ value: '7', label: '7D' },
	{ value: '30', label: '30D' },
	{ value: '90', label: '90D' },
	{ value: '365', label: '1Y' },
]

// Theme-aware colors
const CHART_COLORS = {
	light: {
		marketCap: '#3b82f6', // blue-500
		volume: '#a855f7', // purple-500
		muted: '#64748b', // slate-500
		constructive: '#22c55e', // green-500
		destructive: '#ef4444', // red-500
	},
	dark: {
		marketCap: '#60a5fa', // blue-400
		volume: '#c084fc', // purple-400
		muted: '#94a3b8', // slate-400
		constructive: '#4ade80', // green-400
		destructive: '#f87171', // red-400
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
	marketCapInXNO: number
	volumeInXNO: number
}

interface CustomTooltipProps {
	active?: boolean
	payload?: { value: number; dataKey: string; color: string; payload: ChartDataPoint }[]
	label?: number
	t: ReturnType<typeof useTranslations<'marketCapVolumeChart'>>
	formatValue: (value: number) => string
}

function CustomTooltip({ active, payload, label, t, formatValue }: CustomTooltipProps) {
	if (!active || !payload?.length || !label) return null

	const date = new Date(label)

	return (
		<div className="rounded-md border border-border bg-popover p-3 font-mono shadow-lg">
			<p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
				{date.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}
			</p>
			<div className="space-y-1">
				{payload.map((entry) => (
					<p key={entry.dataKey} className="flex items-center gap-2 text-sm font-semibold tabular-nums">
						<span
							aria-hidden="true"
							className="inline-block h-1.5 w-1.5 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						{entry.dataKey === 'marketCapInXNO' ? t('marketCap') : t('volume')}:
						<span className="text-muted-foreground">{formatValue(entry.value)}</span>
					</p>
				))}
			</div>
		</div>
	)
}

function StatCell({
	label,
	value,
	color,
	accent,
}: {
	label: string
	value: string
	color?: string
	accent?: 'up' | 'down'
}) {
	return (
		<div className="rounded-md border border-border bg-muted/30 px-3 py-2">
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
			<p
				suppressHydrationWarning
				className={cn(
					'mt-1 truncate font-mono text-sm font-semibold tabular-nums leading-none',
					accent === 'up' && 'text-trendup',
					accent === 'down' && 'text-trenddown',
					!accent && !color && 'text-foreground',
				)}
				style={color && !accent ? { color } : undefined}
			>
				{value}
			</p>
		</div>
	)
}

export function MarketCapVolumeChart({ coinId }: MarketCapVolumeChartProps) {
	const t = useTranslations('marketCapVolumeChart')
	const { resolvedTheme } = useTheme()

	const isXno = coinId === CRYPTO_IDS.NANO
	const preferredFiat = useAtomValue(primaryFiatAtom)

	const [timeRange, setTimeRange] = useState<ChartTimeRange>('30')
	const [chartType, setChartType] = useState<'area' | 'line'>('area')
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

	const { prices, isLoading, error } = usePriceChart(coinId, timeRange, isXno ? selectedFiat : undefined)

	const chartData: ChartDataPoint[] = useMemo(() => {
		if (!prices.length) return []

		return prices.map((point) => ({
			timestamp: point.timestamp,
			// For XNO with fiat: use raw marketCap/volume (already in fiat from API)
			// For other coins: use the XNO-denominated values (inverted shows XNO in terms of coin)
			marketCapInXNO: isXno ? point.marketCap : inverted ? point.xnoMarketCapInCoin : point.marketCapInXNO,
			volumeInXNO: isXno ? point.volume : inverted ? point.xnoVolumeInCoin : point.volumeInXNO,
		}))
	}, [prices, isXno, inverted])

	// Calculate stats
	const stats = useMemo(() => {
		if (chartData.length < 2) {
			return {
				marketCapChange: 0,
				startMC: 0,
				endMC: 0,
				minMC: 0,
				maxMC: 0,
				avgVol: 0,
				minVol: 0,
				maxVol: 0,
			}
		}

		const marketCaps = chartData.map((d) => d.marketCapInXNO)
		const volumes = chartData.map((d) => d.volumeInXNO)

		const firstMC = chartData[0].marketCapInXNO
		const lastMC = chartData[chartData.length - 1].marketCapInXNO
		const marketCapChange = firstMC > 0 ? ((lastMC - firstMC) / firstMC) * 100 : 0

		return {
			marketCapChange,
			startMC: firstMC,
			endMC: lastMC,
			minMC: Math.min(...marketCaps),
			maxMC: Math.max(...marketCaps),
			avgVol: volumes.reduce((a, b) => a + b, 0) / volumes.length,
			minVol: Math.min(...volumes),
			maxVol: Math.max(...volumes),
		}
	}, [chartData])

	const isMCPositive = stats.marketCapChange >= 0
	const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light

	const fiatSymbol = selectedFiat.toUpperCase()
	const unit = isXno ? fiatSymbol : inverted ? (coin?.symbol?.toUpperCase() ?? coinId.toUpperCase()) : 'XNO'
	const formatValue = (value: number) => formatLargeNumber(value, { unit })

	if (error) {
		return (
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<p>{t('errorLoading')}</p>
			</div>
		)
	}

	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<div>
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							{isXno
								? t('title', { coin: 'XNO', quote: fiatSymbol })
								: inverted
									? t('titleInverted', {
											coin: coin?.symbol?.toUpperCase() ?? coinId.toUpperCase(),
											quote: 'XNO',
										})
									: t('title', {
											coin: coin?.symbol?.toUpperCase() ?? coinId.toUpperCase(),
											quote: 'XNO',
										})}
						</p>
						<div className="mt-1 flex items-center gap-2">
							<span className="font-mono text-base font-bold uppercase tracking-wider">
								{isXno
									? `XNO/${fiatSymbol}`
									: inverted
										? `XNO/${coin?.symbol?.toUpperCase()}`
										: `${coin?.symbol?.toUpperCase()}/XNO`}
							</span>
							{!isXno && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setInverted(!inverted)}
									className="h-7 w-7 p-0 cursor-pointer"
									title={t('invertChart')}
								>
									<ArrowRightLeft className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>
					</div>
					{isXno && (
						<Select value={selectedFiat} onValueChange={(v) => setSelectedFiat(v as FiatCurrencyCode)}>
							<SelectTrigger className="h-7 w-fit font-mono text-xs cursor-pointer">
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

				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<div className="flex items-center gap-1">
						<Button
							variant={referenceLines.start ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setReferenceLines((prev) => ({ ...prev, start: !prev.start }))}
							className="h-7 px-2 font-mono text-[10px] uppercase tracking-widest cursor-pointer"
						>
							{t('startMC')}
						</Button>
						<Button
							variant={referenceLines.end ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setReferenceLines((prev) => ({ ...prev, end: !prev.end }))}
							className="h-7 px-2 font-mono text-[10px] uppercase tracking-widest cursor-pointer"
						>
							{t('endMC')}
						</Button>
						<Button
							variant={referenceLines.min ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setReferenceLines((prev) => ({ ...prev, min: !prev.min }))}
							className="h-7 px-2 font-mono text-[10px] uppercase tracking-widest text-destructive cursor-pointer"
						>
							{t('low')}
						</Button>
						<Button
							variant={referenceLines.max ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setReferenceLines((prev) => ({ ...prev, max: !prev.max }))}
							className="h-7 px-2 font-mono text-[10px] uppercase tracking-widest text-constructive cursor-pointer"
						>
							{t('high')}
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							<Button
								variant={chartType === 'line' ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setChartType('line')}
								className="h-7 w-7 p-0 cursor-pointer"
								title={t('lineChart')}
							>
								<LineChartIcon className="h-3.5 w-3.5" />
							</Button>
							<Button
								variant={chartType === 'area' ? 'secondary' : 'ghost'}
								size="sm"
								onClick={() => setChartType('area')}
								className="h-7 w-7 p-0 cursor-pointer"
								title={t('areaChart')}
							>
								<AreaChartIcon className="h-3.5 w-3.5" />
							</Button>
						</div>

						<Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as ChartTimeRange)}>
							<TabsList className="h-7 rounded-md">
								{TIME_RANGES.map((range) => (
									<TabsTrigger
										key={range.value}
										value={range.value}
										className="px-2 font-mono text-[10px] uppercase tracking-wider cursor-pointer"
									>
										{range.label}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</div>
			</div>

			{/* Stat strip */}
			<div className="mt-4">
				{isLoading ? (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
							<div
								key={`stat-${index}`}
								className="rounded-md border border-border bg-muted/30 px-3 py-2"
							>
								<Skeleton className="h-3 w-12" />
								<Skeleton className="mt-1.5 h-4 w-16" />
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
						<StatCell label={t('startMC')} value={formatValue(stats.startMC)} color={colors.marketCap} />
						<StatCell label={t('endMC')} value={formatValue(stats.endMC)} color={colors.marketCap} />
						<StatCell
							label={t('marketCapChange')}
							value={`${stats.marketCapChange >= 0 ? '+' : ''}${stats.marketCapChange.toFixed(2)}%`}
							accent={isMCPositive ? 'up' : 'down'}
						/>
						<StatCell label={t('low')} value={formatValue(stats.minMC)} color={colors.marketCap} />
						<StatCell label={t('high')} value={formatValue(stats.maxMC)} color={colors.marketCap} />
						<StatCell
							label={t('diff')}
							value={formatValue(stats.maxMC - stats.minMC)}
							color={colors.marketCap}
						/>
						<StatCell
							label={t('spread')}
							value={`${stats.minMC > 0 ? (((stats.maxMC - stats.minMC) / stats.minMC) * 100).toFixed(2) : '0.00'}%`}
						/>
						<StatCell label={t('avgVolume')} value={formatValue(stats.avgVol)} color={colors.volume} />
						<StatCell label={t('minVolume')} value={formatValue(stats.minVol)} color={colors.volume} />
						<StatCell label={t('maxVolume')} value={formatValue(stats.maxVol)} color={colors.volume} />
					</div>
				)}
			</div>

			{/* Chart */}
			<div className="mt-4">
				{isLoading ? (
					<div className="relative h-75 w-full overflow-hidden rounded-md">
						<LoadingArea />
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<ComposedChart data={chartData} margin={{ top: 5, right: -10, left: -10, bottom: 5 }}>
							<defs>
								<linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={colors.marketCap} stopOpacity={0.3} />
									<stop offset="95%" stopColor={colors.marketCap} stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={colors.muted}
								strokeOpacity={0.15}
								vertical={false}
							/>
							<XAxis
								dataKey="timestamp"
								tickFormatter={(ts) => formatXAxis(ts, timeRange)}
								stroke={colors.muted}
								fontSize={11}
								tickLine={false}
								axisLine={false}
								minTickGap={30}
							/>
							<YAxis
								yAxisId="marketCap"
								orientation="left"
								tickFormatter={(v) => formatLargeNumber(v, { decimals: 0 })}
								stroke={colors.marketCap}
								fontSize={11}
								tickLine={false}
								axisLine={false}
								width={60}
							/>
							<YAxis
								yAxisId="volume"
								orientation="right"
								tickFormatter={(v) => formatLargeNumber(v, { decimals: 0 })}
								stroke={colors.volume}
								fontSize={11}
								tickLine={false}
								axisLine={false}
								width={60}
							/>
							<Tooltip content={<CustomTooltip t={t} formatValue={formatValue} />} />
							{referenceLines.start && (
								<ReferenceLine
									yAxisId="marketCap"
									y={stats.startMC}
									stroke={isMCPositive ? colors.constructive : colors.destructive}
									strokeWidth={1}
								/>
							)}
							{referenceLines.end && (
								<ReferenceLine
									yAxisId="marketCap"
									y={stats.endMC}
									stroke={isMCPositive ? colors.constructive : colors.destructive}
									strokeWidth={1}
								/>
							)}
							{referenceLines.min && (
								<ReferenceLine
									yAxisId="marketCap"
									y={stats.minMC}
									stroke={colors.destructive}
									strokeDasharray="4 4"
									strokeWidth={1}
								/>
							)}
							{referenceLines.max && (
								<ReferenceLine
									yAxisId="marketCap"
									y={stats.maxMC}
									stroke={colors.constructive}
									strokeDasharray="4 4"
									strokeWidth={1}
								/>
							)}
							{referenceLines.start && referenceLines.end && (
								<ReferenceArea
									yAxisId="marketCap"
									y1={stats.startMC}
									y2={stats.endMC}
									fill={isMCPositive ? colors.constructive : colors.destructive}
									fillOpacity={0.1}
								/>
							)}
							<Bar
								yAxisId="volume"
								dataKey="volumeInXNO"
								fill={colors.volume}
								fillOpacity={0.5}
								radius={[2, 2, 0, 0]}
								isAnimationActive={false}
							/>
							{chartType === 'area' ? (
								<Area
									yAxisId="marketCap"
									type="monotone"
									dataKey="marketCapInXNO"
									stroke={colors.marketCap}
									strokeWidth={2}
									fill="url(#marketCapGradient)"
									animationDuration={750}
								/>
							) : (
								<Line
									yAxisId="marketCap"
									type="monotone"
									dataKey="marketCapInXNO"
									stroke={colors.marketCap}
									strokeWidth={2}
									dot={false}
								/>
							)}
						</ComposedChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	)
}
