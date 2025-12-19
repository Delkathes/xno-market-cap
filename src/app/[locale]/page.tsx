import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

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

export const dynamic = 'force-static'
export const revalidate = 60

export default async function Home({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const queryClient = getQueryClient()

	// Prefetch data on the server
	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<main className="container mx-auto px-4 py-8">
			{/* Hydrate the query cache with the initial data */}
			<HydrationBoundary state={dehydrate(queryClient)}>
				<MarketOverview />
				<div className="mt-8">
					<MarketCapTable />
				</div>
			</HydrationBoundary>
		</main>
	)
}
