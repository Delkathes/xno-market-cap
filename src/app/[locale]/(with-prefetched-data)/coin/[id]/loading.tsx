import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingArea } from '@/components/loading-area'

export default async function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-6">
				<CoinInfoCardSkeleton />
				<PriceChartSkeleton />
			</div>
		</main>
	)
}

export function CoinInfoCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 gap-x-14 sm:gap-12 w-fit">
						{[...Array(4)].map((_, i) => {
							const key = `skeleton-${i}`
							return (
								<div key={key} className="space-y-1">
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-5 w-20" />
								</div>
							)
						})}
					</div>
				</div>
			</CardHeader>
		</Card>
	)
}

function PriceChartSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-2 gap-6 sm:gap-2">
				<div className="flex justify-between">
					<Skeleton className="h-8 w-36" />
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-8 w-36 sm:w-96" />
						<Skeleton className="h-8 w-36 sm:hidden" />
					</div>
				</div>
				<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl sm:mt-4">
					<Skeleton className="h-9 w-full sm:w-96" />
					<Skeleton className="h-9 w-full sm:w-96" />
				</div>
			</CardHeader>
			<CardContent className="pb-4 px-4">
				<div className="h-75 w-full relative rounded-lg overflow-hidden">
					<LoadingArea />
				</div>
			</CardContent>
		</Card>
	)
}
