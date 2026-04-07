import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CardDescription, CardTitle } from '@/components/ui/card'
import { DominanceChart } from '@/components/dominance-chart'
import { DominanceTable } from '@/components/dominance-table'
import { LoadingArea } from '@/components/loading-area'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('hours')

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
	'use cache'
	cacheLife('hours')

	const { locale } = await params

	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'dominance' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
			</div>

			<div className="grid gap-6 mb-8">
				<Suspense fallback=<DominanceChartSkeleton locale={locale} />>
					<DominanceChart />
				</Suspense>
			</div>
			<Suspense fallback=<DominanceTableSkeleton />>
				<DominanceTable />
			</Suspense>
		</main>
	)
}

async function DominanceChartSkeleton({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'dominance' })

	return (
		<div>
			<div className="pb-0">
				<CardTitle>{t('distributionTitle')}</CardTitle>
				<CardDescription>{t('chartDescription', { xnoDominance: '' })}</CardDescription>
			</div>
			<div className="overflow-hidden relative px-4 pb-4">
				<div className="relative h-100 w-full z-0">
					<LoadingArea />
				</div>
			</div>
		</div>
	)
}

async function DominanceTableSkeleton() {
	return <div className="overflow-hidden h-405.75 relative" />
}
