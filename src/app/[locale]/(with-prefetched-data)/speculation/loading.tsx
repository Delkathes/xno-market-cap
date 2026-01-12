import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingArea } from '@/components/loading-area'

export default async function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">
					<Skeleton className="h-10 w-72" />
				</h1>
				<div className="text-muted-foreground text-lg">
					<Skeleton className="h-6 w-96" />
				</div>
			</div>

			<SpeculationTableSkeleton />
		</main>
	)
}

export async function SpeculationTableSkeleton() {
	return (
		<Card className="overflow-hidden h-513.75 relative">
			<LoadingArea />
		</Card>
	)
}
