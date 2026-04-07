import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CRYPTO_IDS } from '@/lib/constants'
import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'
import { getPriceChart } from '@/lib/price-chart-service'

import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CoinInfoCard } from '@/components/coin-info-card'
import { LoadingArea } from '@/components/loading-area'
import { MarketCapVolumeChart } from '@/components/market-cap-volume-chart'
import { PriceChart } from '@/components/price-chart'

type Props = {
	params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

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

// Generate static params for known coins
export async function generateStaticParams() {
	try {
		const marketData = await getMarketData()
		return marketData.data
			.map((coin) => ({
				id: coin.id,
			}))
			.slice(0, 5)
	} catch {
		// Return empty array if market data fails, pages will be generated on-demand
		return []
	}
}

export default async function CoinDetailPage({ params }: Props) {
	'use cache'
	cacheLife('hours')

	const { locale, id: coinIdParam } = await params

	setRequestLocale(locale)

	const queryClient = getQueryClient()

	// For XNO, prefetch with default fiat currency (USD); for other coins, no vsCurrency
	const isXno = coinIdParam === CRYPTO_IDS.NANO
	const defaultFiat = 'usd'

	// Prefetch market data and initial chart data
	void queryClient.prefetchQuery({
		queryKey: ['price-chart', coinIdParam, '30', isXno ? defaultFiat : undefined],
		queryFn: () => getPriceChart(coinIdParam, '30', isXno ? defaultFiat : undefined),
	})

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-16">
				<Suspense fallback=<CoinInfoCardSkeleton />>
					<CoinInfoCard coinId={coinIdParam} />
				</Suspense>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Suspense fallback=<PriceChartSkeleton />>
						<PriceChart coinId={coinIdParam} />
					</Suspense>
					<Suspense fallback=<MarketCapVolumeChartSkeleton />>
						<MarketCapVolumeChart coinId={coinIdParam} />
					</Suspense>
				</HydrationBoundary>
			</div>
		</main>
	)
}

function CoinInfoCardSkeleton() {
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
		<div className="pb-1">
			<div className="gap-6 sm:gap-2 mb-8">
				<div className="flex justify-between">
					<div className="h-8 w-36" />
					<div className="flex flex-col gap-y-2">
						<div className="h-8 w-36 sm:w-96" />
						<div className="h-8 w-36 sm:hidden" />
					</div>
				</div>
				<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl sm:mt-4">
					<div className="h-9 w-full sm:w-80" />
					<div className="h-9 w-full sm:w-80" />
				</div>
			</div>
			<div className="h-75 w-full relative rounded-lg overflow-hidden">
				<LoadingArea />
			</div>
		</div>
	)
}

function MarketCapVolumeChartSkeleton() {
	return (
		<div className="pb-1">
			<div className="gap-6 sm:gap-2 mb-8">
				<div className="flex justify-between">
					<div className="h-8 w-36" />
					<div className="flex flex-col gap-y-2">
						<div className="h-8 w-36 sm:w-96" />
						<div className="h-8 w-36 sm:hidden" />
					</div>
				</div>
				<div className="gap-4 grow flex flex-col sm:grid sm:grid-cols-2 max-w-4xl sm:mt-4">
					<div className="h-9 w-full sm:w-80" />
					<div className="h-9 w-full sm:w-80" />
					<div className="h-9 w-full sm:w-80" />
				</div>
			</div>
			<div className="h-75 w-full relative rounded-lg overflow-hidden">
				<LoadingArea />
			</div>
		</div>
	)
}
