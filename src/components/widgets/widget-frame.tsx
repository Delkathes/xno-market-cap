import type { ReactNode } from 'react'

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
 */
export function WidgetFrame({
	label,
	led,
	ledPulse = false,
	children,
	height,
	bodyAlign = 'center',
}: {
	label: string
	led: LedState
	ledPulse?: boolean
	children: ReactNode
	height: number
	/** Vertical placement of the body content: 'center' for stat cards,
	 * 'start' for growing lists (live feed) anchored to the top. */
	bodyAlign?: 'center' | 'start'
}) {
	return (
		<section
			className="relative flex w-full flex-col overflow-hidden rounded-md border border-border bg-card"
			style={{ height }}
			aria-label={label}
		>
			{/* Corner registration marks */}
			<span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-2.5 w-px bg-[#209CE9]/50" />
			<span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-px w-2.5 bg-[#209CE9]/50" />
			<span
				aria-hidden="true"
				className="pointer-events-none absolute right-1 top-1 h-2.5 w-px bg-[#209CE9]/50"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute right-1 top-1 h-px w-2.5 bg-[#209CE9]/50"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-px bg-[#209CE9]/50"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-1 left-1 h-px w-2.5 bg-[#209CE9]/50"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-1 right-1 h-2.5 w-px bg-[#209CE9]/50"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-1 right-1 h-px w-2.5 bg-[#209CE9]/50"
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

			<div
				className={cn(
					'flex min-h-0 flex-1 flex-col px-4 py-3',
					bodyAlign === 'center' ? 'justify-center' : 'justify-start',
				)}
			>
				{children}
			</div>

			<WidgetAttribution />
		</section>
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
