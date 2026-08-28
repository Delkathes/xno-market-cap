'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'

import { useTheme } from '@/components/theme-provider'

export interface TreemapDatum {
	address: string | null
	weightXno: number
	share: number
	[key: string]: string | number | null
}

const TREEMAP_RAMP = {
	light: ['#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985'],
	dark: ['#134e6f', '#1478a8', '#179fea', '#22b8ff', '#4ac9ff', '#7dd8ff', '#b8ecff'],
	others: {
		light: '#cbd5e1',
		dark: '#334155',
	},
	text: {
		light: '#0f172a',
		dark: '#e2e8f0',
	},
} as const

type RepTreemapProps = {
	data: TreemapDatum[]
	height?: number
}

export function RepTreemap({ data, height = 420 }: RepTreemapProps) {
	const t = useTranslations('decentralization')
	const { resolvedTheme } = useTheme()
	// Theme-aware palette only after mount (see lorenz-chart.tsx): the server
	// renders the light ramp, and the first client render must match it.
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])
	const isDark = mounted && resolvedTheme === 'dark'

	const maxShare = data.reduce((max, item) => Math.max(max, item.share), 0)

	const colorFor = (share: number): string => {
		if (maxShare <= 0) return TREEMAP_RAMP.dark[0]
		const ratio = share / maxShare
		const ramp = isDark ? TREEMAP_RAMP.dark : TREEMAP_RAMP.light
		return ramp[Math.min(ramp.length - 1, Math.floor(ratio * ramp.length))]
	}

	return (
		<ResponsiveContainer width="100%" height={height}>
			<Treemap
				data={data}
				dataKey="weightXno"
				nameKey="address"
				stroke="transparent"
				content={({ x, y, width, height: cellHeight, index }) => {
					const item = data[index]
					if (
						item === undefined ||
						x === undefined ||
						y === undefined ||
						width === undefined ||
						cellHeight === undefined
					) {
						return <g />
					}
					const isTop = item.address !== null && maxShare > 0 && item.share === maxShare
					const fill =
						item.address === null
							? isDark
								? TREEMAP_RAMP.others.dark
								: TREEMAP_RAMP.others.light
							: colorFor(item.share)
					const showLabel = width > 88 && cellHeight > 30
					return (
						<g>
							<rect
								x={x + 1}
								y={y + 1}
								width={Math.max(0, width - 2)}
								height={Math.max(0, cellHeight - 2)}
								fill={fill}
								rx={3}
								style={{ transition: 'fill 200ms ease' }}
							/>
							{showLabel && (
								<text
									x={x + width / 2}
									y={y + cellHeight / 2}
									textAnchor="middle"
									dominantBaseline="middle"
									fontFamily="var(--font-geist-mono), ui-monospace, monospace"
									fontSize={11}
									fill={
										isTop
											? isDark
												? TREEMAP_RAMP.text.light
												: TREEMAP_RAMP.text.dark
											: isDark
												? TREEMAP_RAMP.text.dark
												: TREEMAP_RAMP.text.light
									}
									fillOpacity={0.9}
								>
									{item.address === null ? t('treemapOthers') : shortenAddress(item.address)}
								</text>
							)}
						</g>
					)
				}}
				animationDuration={700}
				animationEasing="ease-out"
			>
				<Tooltip
					content={({ active, payload }) => {
						if (!active || !payload || payload.length === 0) return null
						const item = payload[0]?.payload as TreemapDatum | undefined
						if (!item) return null
						return (
							<div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
								<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
									{item.address === null ? t('treemapOthers') : t('treemapTooltipTitle')}
								</div>
								<div className="mt-1 font-mono text-xs text-foreground break-all">{item.address}</div>
								<div className="mt-1 text-sm tabular-nums">
									{formatWeight(item.weightXno)} XNO ·{' '}
									{(item.share * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
								</div>
							</div>
						)
					}}
				/>
			</Treemap>
		</ResponsiveContainer>
	)
}

function shortenAddress(address: string): string {
	if (address.length <= 18) return address
	return `${address.slice(0, 9)}...${address.slice(-4)}`
}

function formatWeight(weight: number): string {
	if (weight >= 1_000_000) {
		return `${(weight / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
	}
	if (weight >= 1_000) {
		return `${(weight / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
	}
	return weight.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
