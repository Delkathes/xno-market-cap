import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CRYPTO_IDS } from '@/lib/constants'
import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'
import { getPriceChart } from '@/lib/price-chart-service'

import { CoinInfoCard } from '@/components/coin-info-card'
import { PriceChart } from '@/components/price-chart'

type Props = {
	params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, id } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.coin' })

	// Get market data to find the coin name
	let coinName = id.charAt(0).toUpperCase() + id.slice(1)

	try {
		const marketData = await getMarketData()
		const coin = marketData.data.find((c) => c.id === id)
		if (coin) {
			coinName = coin.name
		}
	} catch {
		// Use default name if market data fails
	}

	return {
		title: t('title', { coin: coinName }),
		description: t('description', { coin: coinName }),
		openGraph: {
			title: t('ogTitle', { coin: coinName }),
			description: t('ogDescription', { coin: coinName }),
			url: `/coin/${id}`,
		},
		alternates: {
			canonical: `/coin/${id}`,
		},
	}
}

export const dynamic = 'force-static'
export const revalidate = 60

// Generate static params for known coins
export async function generateStaticParams() {
	try {
		const marketData = await getMarketData()
		return marketData.data.map((coin) => ({
			id: coin.id,
		}))
	} catch {
		// Return empty array if market data fails, pages will be generated on-demand
		return []
	}
}

export default async function CoinDetailPage({ params }: Props) {
	const { locale, id: coinIdParam } = await params
	setRequestLocale(locale)

	const queryClient = getQueryClient()

	// For XNO, prefetch with default fiat currency (USD); for other coins, no vsCurrency
	const isXno = coinIdParam === CRYPTO_IDS.NANO
	const defaultFiat = 'usd'

	// Prefetch initial chart data
	void queryClient.prefetchQuery({
		queryKey: ['price-chart', coinIdParam, '30', isXno ? defaultFiat : undefined],
		queryFn: () => getPriceChart(coinIdParam, '30', isXno ? defaultFiat : undefined),
	})

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<main className="container mx-auto px-4 py-8">
				<div className="space-y-6">
					<CoinInfoCard coinId={coinIdParam} />
					<PriceChart coinId={coinIdParam} />
				</div>
			</main>
		</HydrationBoundary>
	)
}
