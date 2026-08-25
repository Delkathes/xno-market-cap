import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { Skeleton } from '@/components/ui/skeleton'
import { ModernPageBackground } from '@/components/modern-page-background'
import { ParityCalculator } from '@/components/parity-calculator'
import { ParityHighlight } from '@/components/parity-highlight'
import { ParitySettingsPopover } from '@/components/parity-table'
import { SpeculationCalculator } from '@/components/speculation-calculator'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.calculators' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/calculators',
		},
		alternates: {
			canonical: '/calculators',
		},
	}
}

// Numbered section frame
interface InstrumentPanelProps {
	index: string
	title: string
	description: string
	action?: React.ReactNode
	delay?: number
	children: React.ReactNode
}

// The header is fully static (server-rendered translations) — the skeleton renders
// the same real text so the section headers never shift when content streams in.
function InstrumentPanelHeader({
	index,
	title,
	description,
	action,
}: Omit<InstrumentPanelProps, 'delay' | 'children'>) {
	return (
		<div className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
			<div className="flex items-baseline gap-3 min-w-0">
				<span className="font-mono text-sm text-muted-foreground/60 tabular-nums tracking-widest select-none">
					{index}
				</span>
				<div className="min-w-0">
					<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-balance">{title}</h2>
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{action && <div className="flex-none">{action}</div>}
		</div>
	)
}

function InstrumentPanel({ index, title, description, action, delay = 0, children }: InstrumentPanelProps) {
	return (
		<section className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
			<InstrumentPanelHeader index={index} title={title} description={description} action={action} />
			<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">{children}</div>
		</section>
	)
}

// EditableStatCard skeleton — 94px natural height (125px with the sub-value line)
function StatCardSkeleton({ withSubValue = false }: { withSubValue?: boolean }) {
	return (
		<div className="group relative flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 shadow-[inset_0_1px_0_hsl(var(--border)/0.5)]">
			<Skeleton className="h-5 w-28" />
			<Skeleton className="h-8 w-32" />
			{withSubValue && (
				<div className="border-t border-dashed border-border pt-1.5">
					<Skeleton className="h-4 w-40" />
				</div>
			)}
		</div>
	)
}

// Holder tier card skeleton — 103px natural height
function TierCardSkeleton() {
	return (
		<div className="group relative flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 shadow-[inset_0_1px_0_hsl(var(--border)/0.5)]">
			<div className="flex items-center gap-2.5 pr-6">
				<Skeleton className="h-9 w-9 rounded-full" />
				<Skeleton className="h-5 w-24" />
			</div>
			<Skeleton className="h-6.25 w-32" />
		</div>
	)
}

export default async function CalculatorsPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params

	const t = await getTranslations({ locale, namespace: 'navigation' })
	const tMeta = await getTranslations({ locale, namespace: 'metadata.calculators' })
	const tParity = await getTranslations({ locale, namespace: 'parity' })
	const tParityCalculator = await getTranslations({ locale, namespace: 'parityCalculator' })
	const tSpeculation = await getTranslations({ locale, namespace: 'speculationCalculator' })
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			{/* Hero */}
			<header className="mb-14 sm:mb-16 animate-fade-in-up">
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('calculators')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg max-w-2xl">{tMeta('description')}</p>
				<p className="text-xs text-muted-foreground/70 mt-3">{tDisclaimer('parity')}</p>
			</header>

			<div className="grid gap-14">
				<Suspense
					fallback={
						<div className="grid gap-14">
							{/* 01 — Parity skeleton */}
							<section className="animate-fade-in-up">
								<InstrumentPanelHeader
									index="01"
									title={tParity('nanoScarcityParity')}
									description={tParity('description')}
									action={<Skeleton className="h-9 w-24 rounded-md" />}
								/>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
									<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
										<Skeleton className="h-25.5 rounded-lg sm:h-27.75" />
										{[2, 3, 4, 5].map((index) => (
											<Skeleton key={`parity-skeleton-${index}`} className="h-27.75 rounded-lg" />
										))}
									</div>
								</div>
							</section>
							{/* 02 — Supply skeleton */}
							<section className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
								<InstrumentPanelHeader
									index="02"
									title={tParityCalculator('title')}
									description={tParityCalculator('description')}
								/>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
									<div className="space-y-6">
										<section className="space-y-6 rounded-lg border bg-muted/20 p-4 sm:p-5">
											<div className="flex items-center gap-2 text-xs">
												<Skeleton className="h-8 w-72 max-w-full sm:h-4" />
											</div>
											<div className="grid gap-4 sm:grid-cols-3">
												<div className="space-y-2">
													<Skeleton className="h-3.5 w-24" />
													<Skeleton className="h-9 w-full sm:w-48" />
												</div>
												<div className="space-y-2 sm:w-fit">
													<Skeleton className="h-6 w-32" />
													<Skeleton className="h-9 w-full" />
													<Skeleton className="h-4 w-44" />
												</div>
												<div className="space-y-2 sm:w-fit">
													<Skeleton className="h-6 w-32" />
													<Skeleton className="h-9 w-full" />
													<Skeleton className="h-4 w-24" />
												</div>
											</div>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<Skeleton className="h-6 w-36" />
													<Skeleton className="h-5 w-20" />
												</div>
												<Skeleton className="h-1.5 w-full" />
												<div className="flex justify-between">
													<Skeleton className="h-4 w-4" />
													<Skeleton className="h-4 w-10" />
												</div>
											</div>
										</section>
										<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
											<StatCardSkeleton />
											<StatCardSkeleton />
											<StatCardSkeleton withSubValue />
											<TierCardSkeleton />
										</section>
										<section className="space-y-3 rounded-lg border p-4">
											<div className="flex items-center justify-between gap-2 text-sm">
												<Skeleton className="h-4.25 w-32" />
												<Skeleton className="h-5 w-16" />
											</div>
											<div>
												<div className="relative h-5 overflow-hidden rounded-sm border border-border bg-background/60" />
												<div className="mt-1.5 flex justify-between text-xs">
													<Skeleton className="h-4 w-4" />
													<Skeleton className="h-4 w-48" />
													<Skeleton className="h-4 w-8" />
												</div>
											</div>
										</section>
										<div className="space-y-3">
											<div className="relative rounded-md border border-dashed border-primary/25 bg-primary/5 px-4 py-3">
												<Skeleton className="h-15 w-3/4 sm:h-5" />
											</div>
											<div className="relative rounded-md border border-dashed border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
												<Skeleton className="h-5 w-2/3" />
											</div>
										</div>
									</div>
								</div>
							</section>
							{/* 03 — Speculation skeleton */}
							<section className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
								<InstrumentPanelHeader
									index="03"
									title={tSpeculation('title')}
									description={tSpeculation('description')}
								/>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
									<div className="space-y-6">
										<section className="space-y-6 rounded-lg border bg-muted/20 p-4 sm:p-5">
											<div className="grid gap-4 sm:grid-cols-3">
												<div className="space-y-2">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-9 w-full sm:w-40" />
													<Skeleton className="h-4 w-44" />
												</div>
												<div className="space-y-2">
													<Skeleton className="h-3.5 w-24" />
													<Skeleton className="h-9 w-full sm:w-40" />
												</div>
												<div className="space-y-2">
													<Skeleton className="h-3.5 w-28" />
													<Skeleton className="h-9 w-full sm:w-44" />
												</div>
											</div>
											<div className="space-y-4">
												<div className="flex items-center gap-3">
													<Skeleton className="h-5 w-10 rounded-full" />
													<Skeleton className="h-5 w-52" />
												</div>
											</div>
										</section>
										<section className="rounded-lg border border-primary/25 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
											<div className="flex items-center gap-3 mb-6">
												<Skeleton className="h-10 w-10 rounded-full" />
												<div>
													<Skeleton className="h-5 w-40" />
													<Skeleton className="h-7 w-64" />
												</div>
											</div>
											<div className="flex items-end justify-between gap-4 mb-6">
												<div>
													<Skeleton className="h-5 w-20" />
													<Skeleton className="mt-1 h-12 w-36 sm:h-15" />
												</div>
												<div className="text-right">
													<Skeleton className="ml-auto h-5 w-28" />
													<Skeleton className="mt-1 ml-auto h-8 w-32" />
												</div>
											</div>
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="rounded-lg border bg-muted/30 p-4">
													<Skeleton className="h-5 w-28" />
													<Skeleton className="mt-1 h-8 w-44" />
												</div>
												<div className="rounded-lg border bg-muted/30 p-4">
													<Skeleton className="h-5 w-36" />
													<Skeleton className="mt-1 h-8 w-44" />
												</div>
											</div>
										</section>
									</div>
								</div>
							</section>
						</div>
					}
				>
					<InstrumentPanel
						index="01"
						title={tParity('nanoScarcityParity')}
						description={tParity('description')}
						action={<ParitySettingsPopover />}
						delay={0}
					>
						<ParityHighlight />
					</InstrumentPanel>

					<InstrumentPanel
						index="02"
						title={tParityCalculator('title')}
						description={tParityCalculator('description')}
						delay={120}
					>
						<ParityCalculator />
					</InstrumentPanel>

					<InstrumentPanel
						index="03"
						title={tSpeculation('title')}
						description={tSpeculation('description')}
						delay={240}
					>
						<SpeculationCalculator />
					</InstrumentPanel>
				</Suspense>
			</div>
		</main>
	)
}
