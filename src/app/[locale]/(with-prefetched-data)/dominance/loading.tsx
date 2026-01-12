import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingArea } from '@/components/loading-area'

export default async function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<PageHeadSkeleton />

			<div className="grid gap-6 mb-8">
				<DominanceChartSkeleton />
			</div>

			<DominanceTableSkeleton />
		</main>
	)
}

export function PageHeadSkeleton() {
	return (
		<div className="mb-8">
			<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">
				<Skeleton className="h-10 w-72" />
			</h1>
			<div className="text-muted-foreground text-lg">
				<Skeleton className="h-6 w-96" />
			</div>
		</div>
	)
}

export async function DominanceChartSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-0">
				<CardTitle>
					<Skeleton className="h-6 w-48" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="h-4 w-72" />
				</CardDescription>
			</CardHeader>
			<CardContent className="overflow-hidden relative px-4 pb-4">
				<div className="relative h-100 w-full">
					<LoadingArea />
				</div>
			</CardContent>
		</Card>
	)
}

export async function DominanceTableSkeleton() {
	return (
		<Card className="overflow-hidden h-513.75 relative">
			<LoadingArea />
		</Card>
	)
}
