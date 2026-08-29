import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { getNewsMetadata } from '@/lib/news'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Skeleton } from '@/components/ui/skeleton'
import { HreflangLinks } from '@/components/hreflang-links'
import MarketDataShell from '@/components/market-data-shell'
import { MilestonesView } from '@/components/milestones-view'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
}

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.milestones' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('title'),
			description: t('description'),
			url: '/milestones',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/milestones', locale),
		},
	}
}

export default async function MilestonesPage({ params }: Props) {
	const { locale } = await params

	return <MilestonesContent locale={locale} />
}

async function MilestonesContent({ locale }: { locale: string }) {
	'use cache'
	cacheLife('hours')

	const t = await getTranslations({ locale, namespace: 'milestones' })

	// Editorial hook: only shown while the $1B story is published in this locale
	const storyArticle = await getNewsMetadata('xno-one-billion-market-cap', locale)
	const story = storyArticle ? { label: storyArticle.title } : undefined

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path="/milestones" />
				<ModernPageBackground />

				<header className="mb-8 animate-fade-in-up sm:mb-10">
					<h1 className="text-4xl font-bold tracking-tight text-balance mb-3 md:text-5xl">{t('title')}</h1>
					<p className="text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
				</header>

				<Suspense
					fallback={<MilestonesSkeleton story={story} supplyNote={t('supplyNote', { supply: '133.25M' })} />}
				>
					<MilestonesView story={story} />
				</Suspense>
			</main>
		</MarketDataShell>
	)
}

function MilestonesSkeleton({ story, supplyNote }: { story?: { label: string }; supplyNote: string }) {
	// Mirrors the real layout (see milestones-view.tsx) block by block so the
	// fallback and the hydrated content share the same height at every
	// breakpoint: header row, count-up number, gauge track + tick labels, footer
	// row on the master; header, compact gauge, price/next rows and the 3-row
	// ladder on each panel. The footer note renders the real translated text
	// invisibly so it wraps at exactly the same widths as the live content, with
	// the skeleton block overlaid on top.
	return (
		<div className="space-y-4">
			<div className="animate-fade-in-up rounded-md border bg-card p-4 sm:p-5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Skeleton className="h-4 w-28" />
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-6.5 w-20.75" />
						<Skeleton className="h-6.5 w-37" />
						<Skeleton className="h-6.5 w-30" />
						<Skeleton className="h-6.5 w-17.75" />
					</div>
				</div>
				<div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<Skeleton className="h-9 w-32 sm:h-10 sm:w-44" />
					<Skeleton className="h-4 w-24 sm:w-32" />
				</div>
				<div className="mt-4 px-1">
					<Skeleton className="h-3 w-full rounded-full" />
					<div className="mt-1.5 h-4" />
				</div>
				<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-3">
					<Skeleton className="h-4 w-72" />
					<Skeleton className="h-4 w-28" />
				</div>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((panel) => (
					<div key={panel} className="flex flex-col rounded-md border bg-card p-4">
						<div className="flex items-baseline justify-between gap-3">
							<Skeleton className="h-4 w-14" />
							<Skeleton className="h-5 w-24" />
						</div>
						<div className="mt-3 px-1">
							<Skeleton className="h-2 w-full rounded-full" />
							<div className="mt-1.5 h-4" />
						</div>
						<div className="mt-2.5 flex items-baseline gap-2">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-20" />
						</div>
						<div className="mt-2">
							<Skeleton className="h-3.75 w-full" />
						</div>
						<div className="mt-2 border-t border-dashed border-border pt-2">
							<Skeleton className="mb-1 h-3.5 w-10" />
							<div className="space-y-0.5">
								<Skeleton className="h-[23.5px] w-full" />
								<Skeleton className="h-[23.5px] w-full" />
								<Skeleton className="h-[23.5px] w-full" />
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-4">
				<div className="relative min-w-0">
					<p aria-hidden="true" className="invisible font-mono text-[10px] uppercase tracking-widest">
						{supplyNote}
					</p>
					<Skeleton className="absolute inset-0" />
				</div>
				{story && <Skeleton className="h-6.25 w-33.25" />}
			</div>
		</div>
	)
}
