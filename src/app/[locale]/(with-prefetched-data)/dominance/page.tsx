import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DominanceChart } from '@/components/dominance-chart'
import { DominanceTable } from '@/components/dominance-table'
import { LoadingArea } from '@/components/loading-area'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.dominance' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/dominance',
		},
		alternates: {
			canonical: '/dominance',
		},
	}
}

export default async function DominancePage({ params }: Props) {
	const { locale } = await params

	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'dominance' })

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
			</div>

			<div className="grid gap-6 mb-8">
				<Suspense fallback=<DominanceChartSkeleton />>
					<DominanceChart />
				</Suspense>
			</div>
			<Suspense fallback=<DominanceTableSkeleton />>
				<DominanceTable />
			</Suspense>
		</main>
	)
}

async function DominanceChartSkeleton() {
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

async function DominanceTableSkeleton() {
	return (
		<Card className="overflow-hidden h-513.75 relative">
			<LoadingArea />
		</Card>
	)
}
