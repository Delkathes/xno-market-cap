import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingArea } from '@/components/loading-area'
import { MarketCapTable } from '@/components/market-cap-table'
import { MarketOverview } from '@/components/market-overview'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.home' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/',
		},
		alternates: {
			canonical: '/',
		},
	}
}

export default async function Home({ params }: Props) {
	const { locale } = await params

	setRequestLocale(locale)

	return (
		<main className="container mx-auto px-4 py-8">
			<Suspense fallback=<MarketOverviewSkeleton locale={locale} />>
				<MarketOverview />
			</Suspense>
			<div className="mt-8">
				<Suspense fallback=<MarketCapTableSkeleton />>
					<MarketCapTable />
				</Suspense>
			</div>
		</main>
	)
}

export async function MarketOverviewSkeleton({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'home' })

	return (
		<div className="grid grid-cols-1 md:grid-cols-8 gap-4">
			<Card className="md:col-span-2">
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1 sm:mb-2">{t('xnoMarketCap')}</p>
					<Skeleton className="w-30 h-6 my-2 sm:my-1" />
					<div className="flex items-center gap-3 mt-2 flex-wrap">
						<Skeleton className="w-16 h-5 sm:h-4" />
						<Skeleton className="w-16 h-5 sm:h-4" />
						<Skeleton className="w-32 h-5 sm:h-4" />
					</div>
				</CardContent>
			</Card>

			<Card className="md:col-span-4">
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1 sm:mb-2">{t('xnoPrice')} • 24h %</p>
					<div className="grid grid-cols-3 gap-x-1 sm:gap-x-4 gap-y-1">
						{/* Row 1: Prices */}
						<Skeleton className="w-20 h-6 my-0.5 sm:my-1" />
						<Skeleton className="w-20 h-6 my-0.5 sm:my-1" />
						<Skeleton className="w-24 h-6 my-0.5 sm:my-1" />

						{/* Row 2: 24h variations */}
						<Skeleton className="inline-block w-16 h-5" />
						<Skeleton className="inline-block w-16 h-5" />
						<Skeleton className="inline-block w-16 h-5" />
					</div>
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1 sm:mb-2">{t('xnoDominance')}</p>
					<Skeleton className="w-24 h-6 my-2 sm:my-1" />
					<div className="flex items-center gap-4 mt-2">
						<Skeleton className="w-20 h-5" />
						<Skeleton className="w-20 h-5" />
						<Skeleton className="w-20 h-5" />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function MarketCapTableSkeleton() {
	return (
		<div className="h-405.75 relative">
			<div className="h-200 relative">
				<LoadingArea />
			</div>
		</div>
	)
}
