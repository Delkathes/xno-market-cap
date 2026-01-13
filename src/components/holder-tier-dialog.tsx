'use client'

import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatXNOAmount } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

export type TierKey =
	| 'tierLegendaryWhale'
	| 'tierMajorHolder'
	| 'tierSignificantStack'
	| 'tierNotableHolder'
	| 'tierGrowingStack'
	| 'tierStartingOut'
	| 'tierPlankton'

export const TIER_INFO = [
	{
		tierKey: 'tierLegendaryWhale' as const,
		color: 'text-purple-500',
		bgColor: 'bg-purple-500',
		emoji: '🐋',
		threshold: 10,
	},
	{ tierKey: 'tierMajorHolder' as const, color: 'text-blue-500', bgColor: 'bg-blue-500', emoji: '🦈', threshold: 1 },
	{
		tierKey: 'tierSignificantStack' as const,
		color: 'text-cyan-500',
		bgColor: 'bg-cyan-500',
		emoji: '🐬',
		threshold: 0.1,
	},
	{
		tierKey: 'tierNotableHolder' as const,
		color: 'text-emerald-500',
		bgColor: 'bg-emerald-500',
		emoji: '🐠',
		threshold: 0.01,
	},
	{
		tierKey: 'tierGrowingStack' as const,
		color: 'text-green-500',
		bgColor: 'bg-green-500',
		emoji: '🐟',
		threshold: 0.001,
	},
	{
		tierKey: 'tierStartingOut' as const,
		color: 'text-yellow-500',
		bgColor: 'bg-yellow-500',
		emoji: '🦐',
		threshold: 0.0001,
	},
	{
		tierKey: 'tierPlankton' as const,
		color: 'text-muted-foreground',
		bgColor: 'bg-muted-foreground',
		emoji: '🦠',
		threshold: 0,
	},
] as const

const XNO_TOTAL_SUPPLY = 133_248_297

// =============================================================================
// THRESHOLD CHART COMPONENT
// =============================================================================

interface ThresholdChartProps {
	currentPercentage: number
	t: (key: string, values?: Record<string, string | number>) => string
}

// Custom tooltip component
interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{ payload: { percentage: number; maxPeople: number; xno: number } }>
	t: (key: string, values?: Record<string, string | number>) => string
}

function CustomTooltip({ active, payload, t }: CustomTooltipProps) {
	if (!active || !payload?.[0]) return null

	const data = payload[0].payload
	const formatPeople = (n: number): string => {
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
		return Math.round(n).toLocaleString()
	}

	return (
		<div className="bg-card border rounded-lg px-3 py-2 shadow-lg">
			<p className="text-xs font-mono font-medium">
				≤{formatPeople(data.maxPeople)} {t('tierChartPeople')}
			</p>
			<p className="text-xs font-mono text-muted-foreground">
				{formatXNOAmount(data.xno, { compact: false, showSymbol: false })}
			</p>
			<p className="text-[10px] text-muted-foreground mt-1">
				{data.percentage.toLocaleString(undefined, { maximumFractionDigits: data.percentage >= 1 ? 2 : 4 })}%
			</p>
		</div>
	)
}

function ThresholdChart({ currentPercentage, t }: ThresholdChartProps) {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	// Theme-aware colors for Recharts (which doesn't support CSS variables well)
	const colors = useMemo(
		() => ({
			primary: isDark ? '#60a5fa' : '#2563eb', // blue-400 / blue-600
			primaryFaded: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.3)',
			primaryFaint: isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(37, 99, 235, 0.05)',
			muted: isDark ? '#a1a1aa' : '#71717a', // zinc-400 / zinc-500
			border: isDark ? '#3f3f46' : '#e4e4e7', // zinc-700 / zinc-200
			background: isDark ? '#09090b' : '#ffffff', // zinc-950 / white
		}),
		[isDark],
	)

	// Generate chart data points (hyperbola: people = 100 / percentage)
	const chartData = useMemo(() => {
		const data: Array<{ percentage: number; maxPeople: number; xno: number; logPercentage: number }> = []
		// Generate points along the curve on a log scale
		for (let logP = -4; logP <= 2; logP += 0.05) {
			const percentage = 10 ** logP
			const maxPeople = Math.min(100 / percentage, 1_000_000)
			const xno = (percentage / 100) * XNO_TOTAL_SUPPLY
			data.push({ percentage, maxPeople, xno, logPercentage: logP })
		}
		return data
	}, [])

	// Current position data point
	const currentData = useMemo(() => {
		if (currentPercentage <= 0) return null
		const maxPeople = Math.min(100 / currentPercentage, 1_000_000)
		const xno = (currentPercentage / 100) * XNO_TOTAL_SUPPLY
		const logPercentage = Math.log10(Math.max(currentPercentage, 0.0001))
		return { percentage: currentPercentage, maxPeople, xno, logPercentage }
	}, [currentPercentage])

	// Tier threshold points for reference dots
	const tierPoints = useMemo(() => {
		return TIER_INFO.filter((tier) => tier.threshold > 0).map((tier) => ({
			...tier,
			logPercentage: Math.log10(tier.threshold),
			maxPeople: Math.min(100 / tier.threshold, 1_000_000),
		}))
	}, [])

	// Find current tier for coloring
	const currentTier = useMemo(() => {
		return TIER_INFO.find((tier, idx) => {
			const nextTier = TIER_INFO[idx + 1]
			if (!nextTier) return true
			return currentPercentage >= tier.threshold
		})
	}, [currentPercentage])

	// Get tier color as hex for recharts
	const getTierHexColor = (tier: (typeof TIER_INFO)[number] | undefined): string => {
		if (!tier) return 'hsl(var(--primary))'
		switch (tier.tierKey) {
			case 'tierLegendaryWhale':
				return '#a855f7' // purple-500
			case 'tierMajorHolder':
				return '#3b82f6' // blue-500
			case 'tierSignificantStack':
				return '#06b6d4' // cyan-500
			case 'tierNotableHolder':
				return '#10b981' // emerald-500
			case 'tierGrowingStack':
				return '#22c55e' // green-500
			case 'tierStartingOut':
				return '#eab308' // yellow-500
			default:
				return '#71717a' // muted
		}
	}

	// Format X-axis ticks
	const formatXAxis = (value: number): string => {
		const percentage = 10 ** value
		if (percentage >= 1) return `${percentage}%`
		if (percentage >= 0.01) return `${percentage}%`
		return `${percentage}%`
	}

	// Format Y-axis ticks
	const formatYAxis = (value: number): string => {
		if (value >= 1_000_000) return '1M'
		if (value >= 10_000) return '10K'
		if (value >= 100) return '100'
		if (value >= 1) return '1'
		return ''
	}

	return (
		<div className="py-2">
			<p className="text-xs text-muted-foreground text-center mb-1">{t('tierChartLabel')}</p>

			<div className="h-50 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData} margin={{ top: 25, right: 0, bottom: 10, left: 0 }}>
						<defs>
							<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
								<stop offset="100%" stopColor={colors.primary} stopOpacity={0.05} />
							</linearGradient>
						</defs>

						<XAxis
							dataKey="logPercentage"
							type="number"
							domain={[-4, 2]}
							ticks={[-4, -2, 0, 2]}
							tickFormatter={formatXAxis}
							tick={{ fontSize: 9, fill: colors.muted }}
							axisLine={{ stroke: colors.border }}
							tickLine={{ stroke: colors.border }}
							label={{
								value: t('tierChartXAxis'),
								position: 'bottom',
								offset: 0,
								style: { fontSize: 9, fill: colors.muted },
							}}
						/>

						<YAxis
							dataKey="maxPeople"
							type="number"
							scale="log"
							domain={[1, 1_000_000]}
							ticks={[1, 100, 10_000, 1_000_000]}
							tickFormatter={formatYAxis}
							tick={{ fontSize: 9, fill: colors.muted }}
							axisLine={{ stroke: colors.border }}
							tickLine={{ stroke: colors.border }}
							label={{
								value: t('tierChartYAxis'),
								angle: -90,
								position: 'insideLeft',
								offset: 10,
								style: { fontSize: 9, fill: colors.muted, textAnchor: 'middle' },
							}}
							width={40}
						/>

						<Tooltip content={<CustomTooltip t={t} />} />

						<Area
							type="monotone"
							dataKey="maxPeople"
							stroke={colors.primary}
							strokeWidth={2}
							activeDot={{ r: 5, strokeWidth: 2, stroke: colors.background }}
							fill="url(#areaGradient)"
							isAnimationActive={false}
						/>

						{/* Tier threshold markers */}
						{tierPoints.map((tier) => (
							<ReferenceDot
								key={tier.tierKey}
								x={tier.logPercentage}
								y={tier.maxPeople}
								r={4}
								fill={colors.background}
								stroke={getTierHexColor(tier)}
								strokeWidth={4}
								label={{
									value: tier.emoji,
									position: 'top',
									offset: 8,
									style: { fontSize: 12 },
								}}
							/>
						))}

						{/* Current position */}
						{currentData && (
							<>
								<ReferenceLine
									segment={[
										{ x: currentData.logPercentage, y: 1 },
										{ x: currentData.logPercentage, y: currentData.maxPeople },
									]}
									stroke={colors.primary}
									strokeDasharray="1.5 1.5"
									strokeOpacity={0.5}
								/>
								<ReferenceLine
									segment={[
										{ x: -4, y: currentData.maxPeople },
										{ x: currentData.logPercentage, y: currentData.maxPeople },
									]}
									stroke={colors.primary}
									strokeDasharray="1.5 1.5"
									strokeOpacity={0.5}
								/>
								<ReferenceDot
									x={currentData.logPercentage}
									y={currentData.maxPeople}
									r={8}
									fill={getTierHexColor(currentTier)}
									stroke={colors.background}
									strokeWidth={2}
								/>
							</>
						)}
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

// =============================================================================
// MAIN DIALOG COMPONENT
// =============================================================================

interface HolderTierDialogProps {
	currentTierKey: TierKey
	currentPercentage: number
}

export function HolderTierDialog({ currentTierKey, currentPercentage }: HolderTierDialogProps) {
	const t = useTranslations('parityCalculator')

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-6 w-6 text-muted-foreground/50 hover:text-muted-foreground"
				>
					<Info className="h-3.5 w-3.5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t('tierDialogTitle')}</DialogTitle>
					<DialogDescription>{t('tierDialogDescription')}</DialogDescription>
				</DialogHeader>

				{/* Threshold visualization chart */}
				<ThresholdChart currentPercentage={currentPercentage} t={t} />

				{/* Tier list */}
				<div className="space-y-2">
					{TIER_INFO.map((tierItem, index) => (
						<div
							key={tierItem.tierKey}
							className={cn(
								'flex items-center justify-between p-3 rounded-lg border transition-colors',
								currentTierKey === tierItem.tierKey && 'bg-primary/5 border-primary/20',
							)}
						>
							<div className="flex items-center gap-3">
								<span className="text-xl">{tierItem.emoji}</span>
								<span className={cn('font-medium', tierItem.color)}>{t(tierItem.tierKey)}</span>
							</div>
							<span className="text-sm text-muted-foreground font-mono">
								{index === TIER_INFO.length - 1
									? t('tierThresholdBelow', { threshold: TIER_INFO[index - 1].threshold })
									: `≥ ${t('tierThreshold', { threshold: tierItem.threshold })}`}
							</span>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
