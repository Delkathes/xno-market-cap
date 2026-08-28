'use client'

import { useTranslations } from 'next-intl'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'

export interface TreemapDatum {
	address: string | null
	weightXno: number
	share: number
	[key: string]: string | number | null
}

// Theme-aware ramp via CSS custom properties (see globals.css): the values
// flip with the .dark class before first paint, so tiles never re-color after
// mount (no light->dark flash).
const TREEMAP_RAMP = [
	'var(--treemap-1)',
	'var(--treemap-2)',
	'var(--treemap-3)',
	'var(--treemap-4)',
	'var(--treemap-5)',
	'var(--treemap-6)',
	'var(--treemap-7)',
] as const

const TREEMAP_OTHERS = 'var(--treemap-others)'
const TREEMAP_TEXT = 'var(--treemap-text)'
const TREEMAP_TEXT_FLIP = 'var(--treemap-text-flip)'

type RepTreemapProps = {
	data: TreemapDatum[]
	height?: number
}

export function RepTreemap({ data, height = 420 }: RepTreemapProps) {
	const t = useTranslations('decentralization')

	const maxShare = data.reduce((max, item) => Math.max(max, item.share), 0)

	const colorFor = (share: number): string => {
		if (maxShare <= 0) return TREEMAP_RAMP[0]
		const ratio = share / maxShare
		return TREEMAP_RAMP[Math.min(TREEMAP_RAMP.length - 1, Math.floor(ratio * TREEMAP_RAMP.length))]
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
					const fill = item.address === null ? TREEMAP_OTHERS : colorFor(item.share)
					const labelFill = isTop ? TREEMAP_TEXT_FLIP : TREEMAP_TEXT
					const showLabel = width > 88 && cellHeight > 30
					return (
						<g>
							<rect
								x={x + 1}
								y={y + 1}
								width={Math.max(0, width - 2)}
								height={Math.max(0, cellHeight - 2)}
								style={{ fill }}
								rx={3}
							/>
							{showLabel && (
								<text
									x={x + width / 2}
									y={y + cellHeight / 2}
									textAnchor="middle"
									dominantBaseline="middle"
									fontFamily="var(--font-geist-mono), ui-monospace, monospace"
									fontSize={11}
									style={{ fill: labelFill }}
									fillOpacity={0.9}
								>
									{item.address === null ? t('treemapOthers') : shortenAddress(item.address)}
								</text>
							)}
						</g>
					)
				}}
				// No layout animation: the tiles grow from nothing on every mount
				// (replayed on each navigation), which reads as jank; the page's
				// fade-in-up is the entrance.
				isAnimationActive={false}
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
