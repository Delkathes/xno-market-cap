import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { type DecentralizationData, getDecentralizationData } from '@/lib/decentralization-service'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { ConcentrationLadder } from '@/components/decentralization/concentration-ladder'
import { LorenzChart } from '@/components/decentralization/lorenz-chart'
import { RepTreemap, type TreemapDatum } from '@/components/decentralization/rep-treemap'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'decentralization' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/decentralization',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/decentralization', locale),
		},
	}
}

const TOTAL_SUPPLY_XNO = 133_248_297

export default async function DecentralizationPage({ params }: Props) {
	'use cache'
	cacheLife({ revalidate: 3600 })

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'decentralization' })

	let data: DecentralizationData | null = null
	let fetchFailed = false
	try {
		data = await getDecentralizationData()
	} catch (error) {
		console.error('Failed to fetch decentralization data:', error)
		fetchFailed = true
	}

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/decentralization" />
			<ModernPageBackground />

			{/* Hero */}
			<header className="mb-10 animate-fade-in-up">
				<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
					</span>
					{t('kicker')}
				</div>
				<h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg max-w-2xl">{t('intro')}</p>
			</header>

			<div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				{fetchFailed && (
					<div className="rounded-md border border-dashed border-primary/25 bg-primary/5 px-4 py-3 text-sm">
						{t('failedNotice')}
					</div>
				)}

				{data && <StatsCluster data={data} t={t} />}

				{data && data.lorenz.length > 1 && (
					<div className="grid gap-4 lg:grid-cols-5">
						{/* Lorenz curve */}
						<section className="lg:col-span-3 rounded-md border border-border bg-card p-4 sm:p-5">
							<PanelHeader title={t('lorenzTitle')} sub={t('lorenzSub')} />
							<LorenzChart data={data.lorenz} />
							<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-dashed border-border pt-3">
								<LegendSwatch color="var(--chart-curve)" dashed={false} label={t('legendCurve')} />
								<LegendSwatch color="var(--chart-gini)" dashed={true} label={t('legendEquality')} />
								<LegendSwatch
									color="var(--chart-gini-area)"
									dashed={false}
									label={t('legendGiniArea')}
								/>
							</div>
						</section>

						{/* Concentration ladder */}
						<section className="lg:col-span-2 rounded-md border border-border bg-card p-4 sm:p-5">
							<PanelHeader title={t('ladderTitle')} sub={t('ladderHint')} />
							<ConcentrationLadder
								rows={[
									{ key: 'top1', share: data.top1Share },
									{ key: 'top5', share: data.top5Share },
									{ key: 'top10', share: data.top10Share },
									{ key: 'top25', share: data.top25Share },
									{ key: 'top50', share: data.top50Share },
									{ key: 'principals', share: data.principalWeightShare },
								]}
								onlineWeightXno={data.onlineWeightXno}
							/>
						</section>
					</div>
				)}

				{data && data.topReps.length > 0 && (
					<section className="rounded-md border border-border bg-card p-4 sm:p-5">
						<PanelHeader title={t('treemapTitle')} sub={t('treemapHint')} />
						<RepTreemap data={buildTreemapData(data)} />
					</section>
				)}

				<div className="space-y-3 border-t border-dashed border-border pt-5">
					{data && data.repCount > 0 && (
						<p className="font-mono text-xs text-muted-foreground tabular-nums">
							{t('breadth', {
								median: formatWeight(data.medianWeightXno),
								mean: formatWeight(data.meanWeightXno),
								count: data.repCount.toLocaleString(),
							})}
						</p>
					)}
					<p className="text-xs text-muted-foreground/70">{t('updatedNote')}</p>
				</div>
			</div>
		</main>
	)
}

type Translator = Awaited<ReturnType<typeof getTranslations>>

function StatsCluster({ data, t }: { data: DecentralizationData; t: Translator }) {
	const onlineVsSupply = data.onlineWeightXno / TOTAL_SUPPLY_XNO
	const stats = [
		{
			label: t('onlineWeight'),
			value: `${formatWeight(data.onlineWeightXno)} XNO`,
			bar: Math.min(1, onlineVsSupply),
			barLabel: t('onlineVsSupply', {
				pct: (onlineVsSupply * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }),
			}),
		},
		{
			label: t('principalReps'),
			value: data.principalReps.toLocaleString(),
			bar: data.principalWeightShare,
			barLabel: `${(data.principalWeightShare * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}% ${t('principalWeightOfOnline')}`,
		},
		{
			label: t('top10Share'),
			value: `${(data.top10Share * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
			bar: data.top10Share,
			barLabel: t('top10ShareHint'),
		},
		{
			label: t('gini'),
			value: data.gini.toFixed(2),
			glyph: true,
			barLabel: t('giniHint'),
		},
	]

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="group rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
				>
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{stat.label}
					</div>
					<div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{stat.value}</div>
					<div className="mt-3">
						{stat.glyph ? (
							<GiniGlyph lorenz={data.lorenz} />
						) : (
							<div className="h-1 overflow-hidden rounded-full bg-muted/50">
								<div
									className="h-full rounded-full bg-linear-to-r from-primary/60 to-primary"
									style={{ width: `${(stat.bar ?? 0) * 100}%` }}
								/>
							</div>
						)}
						<div className="mt-1.5 text-[11px] text-muted-foreground tabular-nums">{stat.barLabel}</div>
					</div>
				</div>
			))}
		</div>
	)
}

// Tiny real-data Lorenz glyph (equality diagonal vs actual curve) rendered
// server-side: no interactivity needed, just the shape at a glance.
function GiniGlyph({ lorenz }: { lorenz: DecentralizationData['lorenz'] }) {
	const points = lorenz
		.map((point) => {
			const x = (point.countPct / 100) * 100
			const y = 36 - (point.weightPct / 100) * 36
			return `${x.toFixed(1)},${y.toFixed(1)}`
		})
		.join(' ')

	return (
		<svg viewBox="0 0 100 36" className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
			<line
				x1="0"
				y1="36"
				x2="100"
				y2="0"
				style={{ stroke: 'var(--muted-foreground)' }}
				strokeOpacity="0.4"
				strokeDasharray="3 3"
				strokeWidth="1"
			/>
			<polyline
				points={points}
				style={{ stroke: 'var(--chart-curve)' }}
				strokeWidth="1.5"
				strokeLinejoin="round"
				strokeLinecap="round"
				fill="none"
			/>
		</svg>
	)
}

function PanelHeader({ title, sub }: { title: string; sub: string }) {
	return (
		<div className="mb-4">
			<h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</h2>
			<p className="mt-1 text-sm text-muted-foreground/80">{sub}</p>
		</div>
	)
}

function LegendSwatch({ color, dashed, label }: { color: string; dashed: boolean; label: string }) {
	return (
		<div className="flex items-center gap-2">
			<svg width="22" height="8" aria-hidden="true">
				{dashed ? (
					<line
						x1="0"
						y1="4"
						x2="22"
						y2="4"
						style={{ stroke: color }}
						strokeWidth="1.5"
						strokeDasharray="3 3"
					/>
				) : (
					<rect x="0" y="1" width="22" height="6" rx="1.5" style={{ fill: color }} fillOpacity="0.55" />
				)}
			</svg>
			<span className="text-xs text-muted-foreground">{label}</span>
		</div>
	)
}

function polyline({ points, className, strokeWidth }: { points: string; className: string; strokeWidth: number }) {
	return <polyline points={points} className={className} strokeWidth={strokeWidth} />
}

function buildTreemapData(data: DecentralizationData): TreemapDatum[] {
	const TOP_TILES = 24
	const tiles: TreemapDatum[] = data.topReps.slice(0, TOP_TILES).map((rep) => ({
		address: rep.address,
		weightXno: rep.weightXno,
		share: rep.share,
	}))
	const tiledWeight = tiles.reduce((sum, tile) => sum + tile.weightXno, 0)
	const restWeight = data.onlineWeightXno - tiledWeight
	if (restWeight > 0) {
		tiles.push({
			address: null,
			weightXno: restWeight,
			share: restWeight / data.onlineWeightXno,
		})
	}
	return tiles
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
