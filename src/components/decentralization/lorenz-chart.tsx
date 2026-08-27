'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { LorenzPoint } from '@/lib/decentralization-service'

import { useTheme } from '@/components/theme-provider'

const LORENZ_COLORS = {
	light: {
		grid: '#64748b',
		curve: '#0b87c9',
		curveGradientTop: '#22b8ff',
		curveGradientBottom: '#22b8ff',
		gini: '#f59e0b',
		axis: '#64748b',
		text: '#0f172a',
	},
	dark: {
		grid: '#94a3b8',
		curve: '#22b8ff',
		curveGradientTop: '#22b8ff',
		curveGradientBottom: '#0b87c9',
		gini: '#fbbf24',
		axis: '#94a3b8',
		text: '#e2e8f0',
	},
} as const

type LorenzChartProps = {
	data: LorenzPoint[]
	height?: number
}

export function LorenzChart({ data, height = 340 }: LorenzChartProps) {
	const t = useTranslations('decentralization')
	const { resolvedTheme } = useTheme()
	// Theme colors only apply after mount: the server always renders the light
	// palette, so gating on mount keeps the first client render identical to the
	// SSR HTML (no hydration mismatch) before switching to the resolved theme.
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])
	const colors = mounted && resolvedTheme === 'dark' ? LORENZ_COLORS.dark : LORENZ_COLORS.light

	const rows = useMemo(
		() =>
			data.map((point) => ({
				countPct: point.countPct,
				weightPct: point.weightPct,
				equality: point.countPct,
				gap: Math.max(0, point.countPct - point.weightPct),
			})),
		[data],
	)

	const formatPct = (value: number): string => `${Math.round(value)}%`

	return (
		<ResponsiveContainer width="100%" height={height}>
			<AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
				<defs>
					<linearGradient id="lorenzGap" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={colors.gini} stopOpacity={0.45} />
						<stop offset="100%" stopColor={colors.gini} stopOpacity={0.08} />
					</linearGradient>
					<linearGradient id="lorenzUnder" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={colors.curveGradientTop} stopOpacity={0.18} />
						<stop offset="100%" stopColor={colors.curveGradientBottom} stopOpacity={0.02} />
					</linearGradient>
				</defs>
				<CartesianGrid stroke={colors.grid} strokeOpacity={0.15} strokeDasharray="2 6" vertical={false} />
				<XAxis
					dataKey="countPct"
					type="number"
					domain={[0, 100]}
					ticks={[0, 25, 50, 75, 100]}
					tickFormatter={formatPct}
					stroke={colors.axis}
					fontSize={11}
					tickLine={false}
					axisLine={{ stroke: colors.axis, strokeOpacity: 0.3 }}
					label={{
						value: t('lorenzAxisCount'),
						position: 'insideBottom',
						offset: -4,
						fontSize: 10,
						fill: colors.text,
						fillOpacity: 0.45,
					}}
				/>
				<YAxis
					type="number"
					domain={[0, 100]}
					ticks={[0, 25, 50, 75, 100]}
					tickFormatter={formatPct}
					stroke={colors.axis}
					fontSize={11}
					tickLine={false}
					axisLine={{ stroke: colors.axis, strokeOpacity: 0.3 }}
					width={40}
					label={{
						value: t('lorenzAxisWeight'),
						angle: -90,
						position: 'insideLeft',
						offset: 8,
						fontSize: 10,
						fill: colors.text,
						fillOpacity: 0.45,
					}}
				/>
				<Area
					type="monotone"
					dataKey="weightPct"
					stroke={colors.curve}
					strokeWidth={2}
					fill="url(#lorenzUnder)"
					animationDuration={900}
					animationEasing="ease-out"
				/>
				<Area
					type="monotone"
					dataKey="gap"
					stroke="none"
					fill="url(#lorenzGap)"
					animationDuration={900}
					animationEasing="ease-out"
				/>
				<Line
					type="linear"
					dataKey="equality"
					stroke={colors.gini}
					strokeWidth={1}
					strokeDasharray="4 4"
					strokeOpacity={0.7}
					dot={false}
					animationDuration={900}
					animationEasing="ease-out"
				/>
				<Tooltip
					cursor={{ stroke: colors.axis, strokeOpacity: 0.35, strokeDasharray: '3 3' }}
					content={(props) => {
						const { active, payload } = props
						if (!active || !payload || payload.length === 0) return null
						const row = payload[0]?.payload as { countPct: number; weightPct: number } | undefined
						if (!row) return null
						return (
							<div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
								<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
									{t('lorenzTooltipTitle')}
								</div>
								<div className="mt-1 text-sm tabular-nums">
									{t('lorenzTooltipHold', {
										reps: formatPct(row.countPct),
										weight: `${row.weightPct.toFixed(1)}%`,
									})}
								</div>
							</div>
						)
					}}
				/>
			</AreaChart>
		</ResponsiveContainer>
	)
}
