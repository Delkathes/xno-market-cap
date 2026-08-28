import type { ReactNode } from 'react'

// Shared instrument-panel chrome for every tool page: mono header row with an
// index numeral, title and sub, then the interactive instrument below.
export function ToolPanel({
	index,
	title,
	sub,
	children,
}: {
	index: string
	title: string
	sub: string
	children: ReactNode
}) {
	return (
		<section className="rounded-md border border-border bg-card p-4 shadow-xs sm:p-6">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</h2>
					<p className="mt-1 text-sm text-muted-foreground/80">{sub}</p>
				</div>
				<span className="font-mono text-xs text-muted-foreground/40 tabular-nums select-none">{index}</span>
			</div>
			{children}
		</section>
	)
}
