import { MarketCapTableSkeleton } from '@/components/market-cap-table'
import { MarketOverviewSkeleton } from '@/components/market-overview'

export default function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<MarketOverviewSkeleton />
			<div className="mt-8">
				<MarketCapTableSkeleton />
			</div>
		</main>
	)
}
