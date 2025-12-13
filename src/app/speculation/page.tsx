import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { SpeculationTable } from '@/components/speculation-table'

export const metadata: Metadata = {
	title: 'Market Speculation',
	description:
		'What would XNO be worth if it had the same market cap as Bitcoin, Ethereum, or other top cryptocurrencies? Explore hypothetical XNO price scenarios.',
	openGraph: {
		title: 'Market Speculation | NanoMarketCap',
		description:
			'What would XNO be worth if it had the same market cap as Bitcoin or Ethereum? Explore hypothetical price scenarios.',
		url: '/speculation',
	},
	alternates: {
		canonical: '/speculation',
	},
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function SpeculationPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Market Speculation</h1>
					<p className="text-muted-foreground text-lg">
						What would XNO be worth if it had the same market cap as other cryptocurrencies?
					</p>
				</div>

				<SpeculationTable />
			</main>
		</HydrationBoundary>
	)
}
