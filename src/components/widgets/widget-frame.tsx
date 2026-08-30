import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type LedState = 'cyan' | 'green' | 'amber'

const LED_COLOR: Record<LedState, string> = {
	cyan: 'bg-[#209CE9] shadow-[0_0_8px_2px_rgba(32,156,233,0.55)]',
	green: 'bg-[#04b16e] shadow-[0_0_8px_2px_rgba(4,177,110,0.55)]',
	amber: 'bg-amber-400 shadow-[0_0_8px_2px_rgba(245,158,11,0.5)]',
}

/**
 * The instrument module: a bordered card with corner registration marks, a
 * micro-label header with an LED status dot, a dashed hairline and the
 * permanent "Data by NanoMarketCap" attribution plate. Every embed uses this
 * frame — the branding is not removable.
 *
 * The frame is width-responsive: the wrapper is a container query context,
 * and the card height drops from `fullHeight` to `compactHeight` below
 * 380px. Auto-fit embeds then report the real height to the host page. The
 * body also scrolls (instead of clipping) if content still doesn't fit.
 */
export function WidgetFrame({
	label,
	led,
	ledPulse = false,
	children,
	fullHeight,
	compactHeight,
	bodyAlign = 'center',
}: {
	label: string
	led: LedState
	ledPulse?: boolean
	children: ReactNode
	/** Height at ≥380px width. */
	fullHeight: number
	/** Height below the 380px compact breakpoint. */
	compactHeight: number
	/** Vertical placement of the body content: 'center' for stat cards,
	 * 'start' for growing lists (live feed) anchored to the top. */
	bodyAlign?: 'center' | 'start'
}) {
	return (
		<div className="widget-respond w-full">
			<section
				className="widget-body relative flex w-full flex-col overflow-hidden border border-border bg-card"
				style={
					{
						'--w-full': `${fullHeight}px`,
						'--w-compact': `${compactHeight}px`,
					} as CSSProperties
				}
				aria-label={label}
			>
				{/* Corner registration marks */}
				<span
					aria-hidden="true"
					className="pointer-events-none absolute left-0 top-0 h-2.5 w-px bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute left-0 top-0 h-px w-2.5 bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute right-0 top-0 h-2.5 w-px bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute right-0 top-0 h-px w-2.5 bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-px bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-0 left-0 h-px w-2.5 bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-px bg-[#209CE9]/50"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-0 right-0 h-px w-2.5 bg-[#209CE9]/50"
				/>

				{/* Header: micro label + LED */}
				<div className="flex items-center justify-between gap-3 border-b border-dashed border-border/70 px-4 pb-2 pt-3">
					<span className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
						{label}
					</span>
					<span
						aria-hidden="true"
						className={cn(
							'h-1.5 w-1.5 shrink-0 rounded-full',
							LED_COLOR[led],
							ledPulse && 'animate-live-pulse',
						)}
					/>
				</div>

				{/* Body: centered stats or top-anchored lists. Clipped, never
				    scrollable: heights are sized so content always fits, and a
				    mini scrollbar inside an iframe makes no sense. */}
				<div
					className={cn(
						'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3',
						bodyAlign === 'center' ? 'justify-center' : 'justify-start',
					)}
				>
					{children}
				</div>

				<WidgetAttribution />
			</section>
		</div>
	)
}

/** The permanent manufacturer's plate. Non-removable by design. */
export function WidgetAttribution() {
	return (
		<a
			href="https://nanomarketcap.com/widgets"
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center justify-between gap-2 border-t border-dashed border-border/70 px-4 py-1.5 transition-colors hover:bg-accent/40"
		>
			<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
				Data by <span className="font-bold text-foreground/80 group-hover:text-foreground">NanoMarketCap</span>
			</span>
			<span
				aria-hidden="true"
				className="font-mono text-[9px] text-[#209CE9]/80 transition-transform group-hover:translate-x-0.5"
			>
				↗
			</span>
		</a>
	)
}

/** Dashed hairline divider used between body rows. */
export function WidgetDivider() {
	return <div aria-hidden="true" className="my-2.5 border-t border-dashed border-border/70" />
}
