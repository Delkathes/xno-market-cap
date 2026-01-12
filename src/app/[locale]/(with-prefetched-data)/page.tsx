import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { MarketCapTable, MarketCapTableSkeleton } from '@/components/market-cap-table'
import { MarketOverview, MarketOverviewSkeleton } from '@/components/market-overview'

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
			<Suspense fallback={<MarketOverviewSkeleton />}>
				<MarketOverview />
			</Suspense>
			<div className="mt-8">
				<Suspense fallback={<MarketCapTableSkeleton />}>
					<MarketCapTable />
				</Suspense>
			</div>
		</main>
	)
}
