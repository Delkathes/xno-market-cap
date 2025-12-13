import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { DominanceChart } from '@/components/dominance-chart'
import { DominanceTable } from '@/components/dominance-table'

export const metadata: Metadata = {
	title: 'Market Dominance',
	description:
		'Analyze cryptocurrency market share and dominance. See how XNO compares to Bitcoin, Ethereum, and other top cryptocurrencies by market cap percentage.',
	openGraph: {
		title: 'Market Dominance | NanoMarketCap',
		description: 'Analyze cryptocurrency market share and dominance. Compare XNO with top cryptocurrencies.',
		url: '/dominance',
	},
	alternates: {
		canonical: '/dominance',
	},
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function DominancePage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Market Dominance</h1>
					<p className="text-muted-foreground text-lg">
						How does XNO stack up against the giants? Explore market share distribution across the crypto
						landscape.
					</p>
				</div>

				<div className="grid gap-6 mb-8">
					<DominanceChart />
				</div>

				<DominanceTable />
			</main>
		</HydrationBoundary>
	)
}
