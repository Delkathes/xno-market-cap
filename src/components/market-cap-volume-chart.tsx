'use client'

import { useMemo, useState } from 'react'
import { AreaChartIcon, ArrowRightLeft, LineChartIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
	Area,
	Bar,
	ComposedChart,
	Line,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import { CRYPTO_IDS } from '@/lib/constants'
import { formatLargeNumber } from '@/lib/currency-helpers'
import type { ChartTimeRange } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'
import { usePriceChart } from '@/hooks/use-price-chart'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
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
	if (!active || !payload || !payload.length || !label) return null

	const date = new Date(label)

	return (
		<div className="bg-popover border border-border rounded-lg shadow-lg p-3">
			<p className="text-xs text-muted-foreground mb-2">
				{date.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})}
			</p>
			{payload.map((entry) => (
				<p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
					{entry.dataKey === 'marketCapInXNO' ? t('marketCap') : t('volume')}: {formatValue(entry.value)}
				</p>
			))}
		</div>
	)
}

export function MarketCapVolumeChart({ coinId }: MarketCapVolumeChartProps) {
	const t = useTranslations('marketCapVolumeChart')
	const { resolvedTheme } = useTheme()

	const [timeRange, setTimeRange] = useState<ChartTimeRange>('30')
	const [chartType, setChartType] = useState<'area' | 'line'>('area')
	const [inverted, setInverted] = useState(false)
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

	// For XNO itself, this chart doesn't make sense (would just show supply), so hide it
	const isXno = coinId === CRYPTO_IDS.NANO

	const { prices, isLoading, error } = usePriceChart(coinId, timeRange)

	const chartData: ChartDataPoint[] = useMemo(() => {
		if (!prices.length) return []

		return prices.map((point) => ({
			timestamp: point.timestamp,
			// When inverted: show XNO's market cap/volume in terms of this coin
			// When normal: show this coin's market cap/volume in XNO
			marketCapInXNO: inverted ? point.xnoMarketCapInCoin : point.marketCapInXNO,
			volumeInXNO: inverted ? point.xnoVolumeInCoin : point.volumeInXNO,
		}))
	}, [prices, inverted])

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

	// Unit based on inverted state
	const unit = inverted ? (coin?.symbol?.toUpperCase() ?? coinId.toUpperCase()) : 'XNO'
	const formatValue = (value: number) => formatLargeNumber(value, { unit })

	// Don't show this chart for XNO itself
	if (isXno) {
		return null
	}

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
					<div className="relative">
						<CardDescription className="absolute -top-4.5 whitespace-nowrap">
							{inverted
								? t('titleInverted', { coin: coin?.symbol?.toUpperCase() ?? coinId.toUpperCase() })
								: t('title', { coin: coin?.symbol?.toUpperCase() ?? coinId.toUpperCase() })}
						</CardDescription>
						<div className="flex gap-3 sm:items-center">
							<CardTitle className="text-lg whitespace-nowrap">
								{inverted ? `XNO/${coin?.symbol?.toUpperCase()}` : `${coin?.symbol?.toUpperCase()}/XNO`}
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
							<div className="h-9 w-full sm:w-80" />
						</div>
					) : (
						<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl">
							<div className="flex gap-4 sm:gap-x-6">
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('startMC')}</span>
									<span className="text-sm font-medium" style={{ color: colors.marketCap }}>
										{formatValue(stats.startMC)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('endMC')}</span>
									<span className="text-sm font-medium" style={{ color: colors.marketCap }}>
										{formatValue(stats.endMC)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('marketCapChange')}</span>
									<span
										className={cn(
											'text-sm font-medium',
											stats.marketCapChange >= 0 ? 'text-constructive' : 'text-destructive',
										)}
									>
										{stats.marketCapChange >= 0 ? '+' : ''}
										{stats.marketCapChange.toFixed(2)}%
									</span>
								</div>
							</div>
							<div className="flex gap-4 sm:gap-6">
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('low')}</span>
									<span className="text-sm font-medium text-destructive">
										{formatValue(stats.minMC)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('high')}</span>
									<span className="text-sm font-medium text-constructive">
										{formatValue(stats.maxMC)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('diff')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{formatValue(stats.maxMC - stats.minMC)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('spread')}</span>
									<span className="text-sm font-medium text-primary whitespace-nowrap">
										{stats.minMC > 0
											? (((stats.maxMC - stats.minMC) / stats.minMC) * 100).toFixed(2)
											: '0.00'}
										%
									</span>
								</div>
							</div>
							<div className="flex gap-4 sm:gap-x-6 sm:col-span-2">
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('avgVolume')}</span>
									<span className="text-sm font-medium" style={{ color: colors.volume }}>
										{formatValue(stats.avgVol)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('minVolume')}</span>
									<span className="text-sm font-medium" style={{ color: colors.volume }}>
										{formatValue(stats.minVol)}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">{t('maxVolume')}</span>
									<span className="text-sm font-medium" style={{ color: colors.volume }}>
										{formatValue(stats.maxVol)}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="">
				{isLoading ? (
					<div className="h-75 w-full relative rounded-lg overflow-hidden">
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
