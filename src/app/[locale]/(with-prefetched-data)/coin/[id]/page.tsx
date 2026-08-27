import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'

import { CRYPTO_IDS } from '@/lib/constants'
import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'
import { getPriceChart } from '@/lib/price-chart-service'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Skeleton } from '@/components/ui/skeleton'
import { CoinInfoCard } from '@/components/coin-info-card'
import { HreflangLinks } from '@/components/hreflang-links'
import { LoadingArea } from '@/components/loading-area'
import MarketDataShell from '@/components/market-data-shell'
import { ModernPageBackground } from '@/components/modern-page-background'

const PriceChart = dynamic(() => import('@/components/price-chart').then((m) => m.PriceChart), {
	loading: () => <PriceChartSkeleton />,
})

const MarketCapVolumeChart = dynamic(
	() => import('@/components/market-cap-volume-chart').then((m) => m.MarketCapVolumeChart),
	{
		loading: () => <MarketCapVolumeChartSkeleton />,
	},
)

type Props = {
	params: Promise<{ locale: string; id: string }>
}

export const instant = false

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
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath(`/coin/${id}`, locale),
		},
	}
}

// Every piece of this page depends on the [id] param (no static shell to stream),
// so the route renders per-request instead of participating in instant navigation.
// (Declared above; merged with the group pages' instant = false.)

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
	const { id: coinIdParam } = await params

	return <CoinDetailContent coinIdParam={coinIdParam} />
}

async function CoinDetailContent({ coinIdParam }: { coinIdParam: string }) {
	'use cache'
	cacheLife('hours')

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
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path={`/coin/${coinIdParam}`} />
				<ModernPageBackground />

				<div className="space-y-8">
					<div className="animate-fade-in-up">
						<Suspense fallback={<CoinInfoCardSkeleton />}>
							<CoinInfoCard coinId={coinIdParam} />
						</Suspense>
					</div>

					<HydrationBoundary state={dehydrate(queryClient)}>
						<div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
							<PriceChart coinId={coinIdParam} />
						</div>
						<div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
							<MarketCapVolumeChart coinId={coinIdParam} />
						</div>
					</HydrationBoundary>
				</div>
			</main>
		</MarketDataShell>
	)
}

function CoinInfoCardSkeleton() {
	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
					{[1, 2, 3, 4, 5, 6].map((index) => (
						<div key={`stat-${index}`} className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="mt-2 h-4 w-20" />
							<Skeleton className="mt-1.5 h-3 w-10" />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function PriceChartSkeleton() {
	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-5 w-28" />
				</div>
				<Skeleton className="h-7 w-40" />
			</div>
			<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
				{[1, 2, 3, 4, 5, 6, 7].map((index) => (
					<div key={`stat-${index}`} className="rounded-md border border-border bg-muted/30 px-3 py-2">
						<Skeleton className="h-3 w-12" />
						<Skeleton className="mt-1.5 h-4 w-16" />
					</div>
				))}
			</div>
			<div className="relative mt-4 h-75 w-full overflow-hidden rounded-md">
				<LoadingArea />
			</div>
		</div>
	)
}

function MarketCapVolumeChartSkeleton() {
	return (
		<div className="rounded-md border bg-card p-4 sm:p-5">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-5 w-28" />
				</div>
				<Skeleton className="h-7 w-40" />
			</div>
			<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
					<div key={`stat-${index}`} className="rounded-md border border-border bg-muted/30 px-3 py-2">
						<Skeleton className="h-3 w-12" />
						<Skeleton className="mt-1.5 h-4 w-16" />
					</div>
				))}
			</div>
			<div className="relative mt-4 h-75 w-full overflow-hidden rounded-md">
				<LoadingArea />
			</div>
		</div>
	)
}
