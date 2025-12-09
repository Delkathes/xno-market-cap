import type { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { getMarketData } from '@/lib/market-data-service'
import getQueryClient from '@/lib/get-query-client'
import { ParityTable, XNOParityHighlight, ParitySettingsPopover } from '@/components/parity-table'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
	title: 'Absolute Scarcity Parity',
	description:
		'What would 1 XNO be worth if all assets were valued purely by their scarcity? Explore scarcity parity comparisons with Bitcoin, Gold, and major fiat currencies.',
	openGraph: {
		title: 'Absolute Scarcity Parity | NanoMarketCap',
		description:
			'What would 1 XNO be worth if all assets were valued purely by their scarcity? Compare Nano with Bitcoin, Gold, and fiat.',
		url: '/parity',
	},
	alternates: {
		canonical: '/parity',
	},
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function ParityPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Absolute Scarcity Parity</h1>
					<p className="text-muted-foreground text-lg">
						What would 1 XNO be worth if all assets were valued purely by their scarcity?
					</p>
				</div>

				<div className="grid gap-8">
					{/* XNO Parity Highlight */}
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">Nano Scarcity Parity</h2>
							<ParitySettingsPopover />
						</div>
						<XNOParityHighlight />
					</section>

					{/* Main Parity Table */}
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">Scarcity Parity Matrix</h2>
							<ParitySettingsPopover />
						</div>
						<ParityTable />
					</section>

					{/* Key Takeaway */}
					<Card className="border-primary/20">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-3">Key Takeaway</h3>
							<p className="text-muted-foreground mb-4">
								This table accurately reflects the{' '}
								<span className="text-foreground font-medium">scarcity hierarchy</span>. Each XNO
								represents a much larger share of its fixed network than a single Dollar or Euro
								represents of their infinite and expanding networks.
							</p>
							<blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
								Based purely on absolute, un-inflatable supply, a single unit of Nano is fundamentally
								scarcer than a single unit of any other asset on this list—including Bitcoin and Gold.
								This is the power of a fully distributed and absolutely fixed supply.
							</blockquote>
						</CardContent>
					</Card>
				</div>
			</main>
		</HydrationBoundary>
	)
}
