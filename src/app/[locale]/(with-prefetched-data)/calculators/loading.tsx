import { Calculator, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { HighlightSkeleton } from '../parity/loading'

export default function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="grid gap-10">
				<ParityHighlightCalculatorSkeleton />
				<ParityCalculatorSkeleton />
				<SpeculationCalculatorSkeleton />
			</div>
		</main>
	)
}

export async function ParityHighlightCalculatorSkeleton() {
	return (
		<Card className="gap-2">
			<CardHeader className="flex justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-[#209CE9]" />
						<Skeleton className="h-5 w-44" />
					</CardTitle>
					<CardDescription className="relative pt-1">
						<Skeleton className="h-4 w-96" />
					</CardDescription>
				</div>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<Loader2 className="h-4 w-4 animate-spin" />
				</Button>
			</CardHeader>
			<CardContent className="pb-4 px-4">
				<HighlightSkeleton />
			</CardContent>
		</Card>
	)
}

export function ParityCalculatorSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-[#209CE9]" />
						<Skeleton className="h-5 w-40" />
					</CardTitle>
					<CardDescription className="relative pt-1">
						<Skeleton className="h-4 w-100" />
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 pb-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
				</div>
				<Skeleton className="h-32" />
				<Skeleton className="h-24" />
			</CardContent>
		</Card>
	)
}

export function SpeculationCalculatorSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-72" />
			</CardHeader>
			<CardContent className="space-y-6">
				<Skeleton className="h-20" />
				<Skeleton className="h-12" />
				<Skeleton className="h-40" />
			</CardContent>
		</Card>
	)
}
