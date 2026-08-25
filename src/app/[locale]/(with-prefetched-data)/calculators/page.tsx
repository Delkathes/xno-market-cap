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

function InstrumentPanel({ index, title, description, action, delay = 0, children }: InstrumentPanelProps) {
	return (
		<section className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
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
			<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">{children}</div>
		</section>
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
								<div className="mb-5">
									<Skeleton className="h-7 w-72 max-w-full" />
									<Skeleton className="h-4 w-96 max-w-full mt-2" />
								</div>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6 grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
									{[1, 2, 3, 4, 5].map((index) => (
										<Skeleton key={`parity-skeleton-${index}`} className="h-24 rounded-lg" />
									))}
								</div>
							</section>
							{/* 02 — Supply skeleton */}
							<section className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
								<div className="mb-5">
									<Skeleton className="h-7 w-56 max-w-full" />
									<Skeleton className="h-4 w-80 max-w-full mt-2" />
								</div>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6 grid gap-4 sm:grid-cols-2">
									<Skeleton className="h-20" />
									<Skeleton className="h-20" />
									<Skeleton className="h-40 sm:col-span-2" />
									<Skeleton className="h-24 sm:col-span-2" />
								</div>
							</section>
							{/* 03 — Speculation skeleton */}
							<section className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
								<div className="mb-5">
									<Skeleton className="h-7 w-64 max-w-full" />
									<Skeleton className="h-4 w-96 max-w-full mt-2" />
								</div>
								<div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6 grid gap-4 sm:grid-cols-3">
									<Skeleton className="h-20" />
									<Skeleton className="h-20" />
									<Skeleton className="h-20" />
									<Skeleton className="h-32 sm:col-span-3" />
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
