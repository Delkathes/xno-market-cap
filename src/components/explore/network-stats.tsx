import { getTranslations } from 'next-intl/server'

import { getNetworkStats } from '@/lib/network-stats-service'

function formatCount(value: number, locale: string): string {
	return value.toLocaleString(locale)
}

function formatWeight(xno: number, locale: string): string {
	if (xno >= 1_000_000) {
		return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	}
	if (xno >= 1) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 2 })
	}
	if (xno > 0) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
	}
	return '0'
}

/**
 * Ledger telemetry band: block counts, online voting weight, principal reps.
 * Rendered inside the cached page shell; the data itself refreshes on a
 * 5-minute cadence via getNetworkStats.
 */
export async function NetworkStats({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'explore' })
	const stats = await getNetworkStats()
	if (!stats) return null

	const cells = [
		{ label: t('totalBlocks'), value: formatCount(stats.totalBlocks, locale) },
		{ label: t('cementedBlocks'), value: formatCount(stats.cementedBlocks, locale) },
		{ label: t('uncheckedBlocks'), value: formatCount(stats.uncheckedBlocks, locale) },
		{ label: t('onlineWeight'), value: `${formatWeight(stats.onlineWeightXno, locale)} XNO` },
		{ label: t('principalReps'), value: formatCount(stats.principalReps, locale) },
		{
			label: t('principalShare'),
			value: `${(stats.principalShare * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}%`,
		},
	]

	return (
		<div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
			{cells.map((cell, index) => (
				<div
					key={cell.label}
					className="animate-fade-in-up min-w-0 bg-card/95 px-4 py-3.5"
					style={{ animationDelay: `${100 + index * 60}ms` }}
				>
					<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
						{cell.label}
					</div>
					<div className="mt-1 truncate font-mono text-lg font-semibold tabular-nums">{cell.value}</div>
				</div>
			))}
		</div>
	)
}
