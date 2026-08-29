import type { NetworkStats } from '@/lib/network-stats-service'
import { cn } from '@/lib/utils'

import { WidgetDivider, WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetStrings } from '@/components/widgets/widget-registry'

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{label}</span>
			<span
				className={cn(
					'font-mono text-[12px] font-semibold tabular-nums',
					accent ? 'text-[#209CE9]' : 'text-foreground',
				)}
			>
				{value}
			</span>
		</div>
	)
}

function formatCount(value: number, locale?: string): string {
	return value.toLocaleString(locale, { maximumFractionDigits: 0 })
}

function formatWeight(value: number, locale?: string): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M XNO`
	return `${value.toLocaleString(locale, { maximumFractionDigits: 2 })} XNO`
}

export function NetworkWidget({
	t,
	data,
	locale,
	compact,
}: {
	t: WidgetStrings
	data: NetworkStats
	locale: string
	compact: boolean
}) {
	const cementedPct = data.totalBlocks > 0 ? ((data.cementedBlocks / data.totalBlocks) * 100).toFixed(2) : '—'
	const principalSharePct = `${(data.principalShare * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`

	return (
		<WidgetFrame label={t.netLabel} led="green" ledPulse height={compact ? 190 : 230}>
			<div className="flex items-baseline justify-between gap-3">
				<span className="font-mono text-[24px] font-bold leading-none tracking-tight tabular-nums">
					{formatCount(data.totalBlocks, locale)}
				</span>
				<span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#04b16e]">
					<span className="h-1 w-1 rounded-full bg-[#04b16e] shadow-[0_0_6px_1px_rgba(4,177,110,0.6)]" />
					{t.netHealthy}
				</span>
			</div>
			{!compact && <WidgetDivider />}
			<div className="flex flex-col gap-1.5">
				<Row label={t.netCemented} value={`${cementedPct}%`} accent />
				{!compact && <Row label={t.netUnchecked} value={formatCount(data.uncheckedBlocks, locale)} />}
				<Row label={t.netOnlineWeight} value={formatWeight(data.onlineWeightXno, locale)} />
				<Row label={t.netPrincipalReps} value={`${formatCount(data.principalReps, locale)}`} />
				{!compact && <Row label={t.netPrincipalShare} value={principalSharePct} />}
			</div>
		</WidgetFrame>
	)
}
