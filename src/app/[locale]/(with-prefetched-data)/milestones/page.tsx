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

				<Suspense fallback={<MilestonesSkeleton />}>
					<MilestonesView story={story} />
				</Suspense>
			</main>
		</MarketDataShell>
	)
}

function MilestonesSkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-md border bg-card p-4 sm:p-5">
				<Skeleton className="h-4 w-36" />
				<Skeleton className="mt-3 h-9 w-48" />
				<Skeleton className="mt-4 h-3 w-full" />
				<Skeleton className="mt-1.5 h-4 w-full" />
				<div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3">
					<Skeleton className="h-3 w-40" />
					<Skeleton className="h-3 w-32" />
				</div>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((panel) => (
					<div key={panel} className="rounded-md border bg-card p-4">
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-14" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="mt-3 h-2 w-full" />
						<Skeleton className="mt-1.5 h-4 w-full" />
						<Skeleton className="mt-2 h-3 w-32" />
						<Skeleton className="mt-2 h-3 w-24" />
						<div className="mt-3 space-y-1.5 border-t border-dashed border-border pt-2">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
