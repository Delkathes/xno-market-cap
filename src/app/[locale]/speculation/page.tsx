import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { SpeculationTable } from '@/components/speculation-table'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.speculation' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/speculation',
		},
		alternates: {
			canonical: '/speculation',
		},
	}
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function SpeculationPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations('speculation')
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
					<p className="text-muted-foreground text-lg">{t('description')}</p>
				</div>

				<SpeculationTable />
			</main>
		</HydrationBoundary>
	)
}
