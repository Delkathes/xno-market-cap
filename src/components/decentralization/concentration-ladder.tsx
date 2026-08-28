'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export interface LadderRow {
	key: 'top1' | 'top5' | 'top10' | 'top25' | 'top50' | 'principals'
	share: number
}

// Theme-aware accent via CSS custom property (see globals.css): resolves with
// the .dark class before first paint, so no post-mount re-color.
const ACCENT = 'var(--ladder-accent)'

type ConcentrationLadderProps = {
	rows: LadderRow[]
	onlineWeightXno: number
}

export function ConcentrationLadder({ rows, onlineWeightXno }: ConcentrationLadderProps) {
	const t = useTranslations('decentralization')

	// Bars grow from 0 after mount for a one-shot entrance (color is already
	// correct, so this is purely the width animation).
	const [entered, setEntered] = useState(false)
	useEffect(() => {
		const raf = requestAnimationFrame(() => setEntered(true))
		return () => cancelAnimationFrame(raf)
	}, [])

	return (
		<div className="space-y-4">
			{rows.map((row, index) => (
				<div key={row.key} className="space-y-1.5">
					<div className="flex items-baseline justify-between gap-3">
						<span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{row.key === 'principals'
								? t('ladderPrincipals')
								: t('ladderTop', { count: rowKeyCount(row.key) })}
						</span>
						<span className="text-sm tabular-nums">
							{(row.share * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
						</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
						<div
							className="h-full rounded-full"
							style={{
								width: entered ? `${row.share * 100}%` : '0%',
								transition: `width 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms`,
								background: `linear-gradient(90deg, color-mix(in srgb, ${ACCENT} 53%, transparent), ${ACCENT})`,
							}}
						/>
					</div>
				</div>
			))}
			<div className="border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
				{t('ladderFootnote', {
					weight: formatWeight(onlineWeightXno),
				})}
			</div>
		</div>
	)
}

function rowKeyCount(key: LadderRow['key']): number {
	switch (key) {
		case 'top1':
			return 1
		case 'top5':
			return 5
		case 'top10':
			return 10
		case 'top25':
			return 25
		case 'top50':
			return 50
		default:
			return 0
	}
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
