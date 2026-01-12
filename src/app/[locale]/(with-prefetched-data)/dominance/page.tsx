import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { DominanceChart } from '@/components/dominance-chart'
import { DominanceTable } from '@/components/dominance-table'

import { DominanceChartSkeleton, DominanceTableSkeleton } from './loading'

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

	// Enable static rendering
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'dominance' })
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
			</div>

			<Suspense
				fallback={
					<>
						<div className="grid gap-6 mb-8">
							<DominanceChartSkeleton />
						</div>
						<DominanceTableSkeleton />
					</>
				}
			>
				<div className="grid gap-6 mb-8">
					<DominanceChart />
				</div>
				<DominanceTable />
			</Suspense>
		</main>
	)
}
