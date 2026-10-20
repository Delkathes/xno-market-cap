import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Skeleton } from '@/components/ui/skeleton'
import { DominanceTable } from '@/components/dominance-table'
import { HreflangLinks } from '@/components/hreflang-links'
import { LoadingArea } from '@/components/loading-area'
import MarketDataShell from '@/components/market-data-shell'
import { ModernPageBackground } from '@/components/modern-page-background'

const DominanceChart = dynamic(() => import('@/components/dominance-chart').then((m) => m.DominanceChart), {
	loading: () => <DominanceChartSkeleton />,
})

type Props = {
	params: Promise<{ locale: string }>
}

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.dominance' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: localePath('/dominance', locale),
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/dominance', locale),
		},
	}
}

export default async function DominancePage({ params }: Props) {
	const { locale } = await params

	return <DominanceContent locale={locale} />
}

async function DominanceContent({ locale }: { locale: string }) {
	'use cache'
	cacheLife('hours')

	const t = await getTranslations({ locale, namespace: 'dominance' })

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path="/dominance" />
				<ModernPageBackground />

				<header className="mb-12 sm:mb-14 animate-fade-in-up">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('title')}</h1>
					<p className="text-muted-foreground text-base sm:text-lg">{t('description')}</p>
				</header>

				<div className="grid gap-8">
					<div className="animate-fade-in-up">
						<DominanceChart />
					</div>
					<div className="animate-fade-in-up min-w-0" style={{ animationDelay: '150ms' }}>
						<Suspense fallback={<DominanceTableSkeleton />}>
							<DominanceTable />
						</Suspense>
					</div>
				</div>
			</main>
		</MarketDataShell>
	)
}

function DominanceChartSkeleton() {
	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			<Skeleton className="h-6 w-64 max-w-full" />
			<Skeleton className="mt-2 h-4 w-96 max-w-full" />
			<div className="relative mt-4 h-100 w-full overflow-hidden rounded-md">
				<LoadingArea />
			</div>
		</div>
	)
}

function DominanceTableSkeleton() {
	return (
		<div className="rounded-md border border-border bg-card p-4">
			<div className="space-y-2.5">
				{[1, 2, 3, 4, 5, 6].map((row) => (
					<div key={row} className="flex items-center gap-4">
						<Skeleton className="h-4 w-6" />
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-4 w-32" />
						<div className="ml-auto hidden gap-8 sm:flex">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
