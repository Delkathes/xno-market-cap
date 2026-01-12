import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { MarketCapTable } from '@/components/market-cap-table'
import { MarketOverview } from '@/components/market-overview'

import Loading from './loading'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.home' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/',
		},
		alternates: {
			canonical: '/',
		},
	}
}

export default async function Home({ params }: Props) {
	const { locale } = await params

	// Enable static rendering
	setRequestLocale(locale)

	return (
		<Suspense fallback={<Loading />}>
			<main className="container mx-auto px-4 py-8">
				<MarketOverview />
				<div className="mt-8">
					<MarketCapTable />
				</div>
			</main>
		</Suspense>
	)
}
