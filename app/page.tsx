import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { MarketCapTable } from '@/components/market-cap-table'
import { MarketOverview } from '@/components/market-overview'

export const metadata: Metadata = {
	title: 'XNO Price & Market Overview',
	description:
		'Live Nano (XNO) price, market cap, 24h volume, and comparison with top cryptocurrencies. Track XNO performance in real-time.',
	openGraph: {
		title: 'XNO Price & Market Overview | NanoMarketCap',
		description: 'Live Nano (XNO) price, market cap, 24h volume, and comparison with top cryptocurrencies.',
		url: '/',
	},
	alternates: {
		canonical: '/',
	},
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function Home() {
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
