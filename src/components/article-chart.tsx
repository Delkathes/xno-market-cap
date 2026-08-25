'use client'

import dynamic from 'next/dynamic'

import type { FiatCurrencyCode } from '@/lib/types'

import { Skeleton } from '@/components/ui/skeleton'

const ChartImpl = dynamic(() => import('./article-chart-impl').then((m) => m.ArticleChartImpl), {
	loading: () => <Skeleton className="h-full w-full" />,
})

// Real XNO price history chart (recharts is code-split so article bundles stay light).
// The fixed-height frame renders a skeleton on the server and while loading, so the
// chart swap never shifts the article layout.
export function ArticleChart({
	days = '30',
	fiat,
	height = 220,
	title,
}: {
	days?: '7' | '30' | '90'
	fiat?: FiatCurrencyCode
	height?: number
	title?: string
}) {
	return (
		<div className="my-6">
			{title && (
				<p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
			)}
			<div className="rounded-md border border-border bg-muted/30 p-3" style={{ height }}>
				<ChartImpl days={days} fiat={fiat} />
			</div>
		</div>
	)
}
