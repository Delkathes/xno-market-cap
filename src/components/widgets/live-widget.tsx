'use client'

import { cn } from '@/lib/utils'

import { useNetworkConfirmations } from '@/hooks/use-network-confirmations'

import { WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetStrings } from '@/components/widgets/widget-registry'

const SUBTYPE_GLYPH: Record<string, string> = {
	send: '▲',
	receive: '▼',
	open: '◆',
	change: '◈',
	epoch: '◍',
}

function shorten(address: string): string {
	return `${address.slice(0, 8)}…${address.slice(-4)}`
}

function formatAmount(xno: number, locale: string): string {
	if (xno >= 1_000_000) return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	if (xno >= 1) return xno.toLocaleString(locale, { maximumFractionDigits: 2 })
	return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
}

/** Compact network confirmation feed for embeds: no account filter, fixed
 * height, latest rows only. WebSocket only (no CORS; confirmation_history is
 * unsupported on public relays), so it shows a clear offline state. */
export function LiveWidget({
	t,
	siteUrl,
	locale,
	compact,
}: {
	t: WidgetStrings
	siteUrl: string
	locale: string
	compact: boolean
}) {
	const { confirmations, totalSeen, status } = useNetworkConfirmations()
	const rows = confirmations.slice(0, compact ? 3 : 5)
	const isLive = status === 'live'

	const statusLed =
		status === 'live'
			? { label: t.liveLive, cls: 'bg-[#04b16e] shadow-[0_0_6px_1px_rgba(4,177,110,0.6)]', pulse: true }
			: status === 'connecting'
				? {
						label: t.liveConnecting,
						cls: 'bg-amber-400 shadow-[0_0_6px_1px_rgba(245,158,11,0.5)]',
						pulse: true,
					}
				: { label: t.liveOffline, cls: 'bg-[#ea3943] shadow-[0_0_6px_1px_rgba(234,57,67,0.5)]', pulse: false }

	return (
		<WidgetFrame label={t.typeLive} led="cyan" bodyAlign="start" fullHeight={240} compactHeight={208}>
			<div className="flex items-center justify-between gap-3">
				<span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
					<span
						className={cn('h-1 w-1 rounded-full', statusLed.cls, statusLed.pulse && 'animate-live-pulse')}
					/>
					{statusLed.label}
				</span>
				<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
					{totalSeen.toLocaleString(locale)} · {t.netLabel}
				</span>
			</div>
			<div className={cn('mt-2 flex flex-col gap-1 transition-opacity duration-500', !isLive && 'opacity-50')}>
				{rows.length === 0 ? (
					<div className="flex h-24 items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
						{t.liveConnecting}…
					</div>
				) : (
					rows.map((row, index) => (
						<a
							key={row.hash}
							href={`${siteUrl}/${locale}/block/${row.hash}`}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								'flex items-center gap-2 rounded-sm border border-transparent px-1.5 py-1 font-mono text-[10px] transition-colors hover:border-border hover:bg-accent/40',
								// Below the compact breakpoint the frame is 208px:
								// drop to the 3-row compact feed.
								index >= 3 && '@max-[380px]:hidden',
							)}
						>
							<span
								aria-hidden="true"
								className={cn(
									'w-3 flex-none text-center',
									row.subtype === 'send' ? 'text-[#ea3943]' : 'text-[#04b16e]',
								)}
							>
								{SUBTYPE_GLYPH[row.subtype] ?? '•'}
							</span>
							<span className="min-w-0 flex-1 truncate text-muted-foreground">
								<span className="text-foreground">{shorten(row.account)}</span>
								{row.counterparty && (
									<span className="text-muted-foreground/60"> → {shorten(row.counterparty)}</span>
								)}
							</span>
							<span className="flex-none tabular-nums text-foreground/90">
								{formatAmount(row.amountXno, locale)} XNO
							</span>
						</a>
					))
				)}
			</div>
		</WidgetFrame>
	)
}
