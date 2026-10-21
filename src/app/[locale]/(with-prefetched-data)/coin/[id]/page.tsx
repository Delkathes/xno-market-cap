import type { Metadata, Route } from 'next'
import { cacheLife } from 'next/cache'
import dynamic from 'next/dynamic'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'

import { CRYPTO_IDS } from '@/lib/constants'
import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'
import { getPriceChart } from '@/lib/price-chart-service'
import { localePath, ogImage, ogLocale } from '@/lib/seo'
import {
	breadcrumbNode,
	ORGANIZATION_ID,
	organizationNode,
	SITE,
	webPageNode,
	websiteNode,
} from '@/lib/structured-data'
import type { ChartTimeRange } from '@/lib/types'

import { Skeleton } from '@/components/ui/skeleton'
import { CoinInfoCard } from '@/components/coin-info-card'
import { CoinSummary } from '@/components/coin-summary'
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

const INDEXABLE_COIN_IDS = new Set<string>(Object.values(CRYPTO_IDS))

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale, id } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.coin' })

	if (id === 'xno') {
		permanentRedirect(localePath('/coin/nano', locale) as Route)
	}

	let coinName = id.charAt(0).toUpperCase() + id.slice(1)
	let coinFound: boolean | null = null

	try {
		const marketData = await getMarketData()
		const coin = marketData.data.find((c) => c.id === id)
		if (coin) {
			coinName = coin.name
			coinFound = true
		} else {
			coinFound = false
		}
	} catch {
		// Use default name if market data fails
	}

	if (coinFound === false) {
		notFound()
	}

	return {
		title: { absolute: t('title', { coin: coinName }) },
		description: t('description', { coin: coinName }),
		robots: {
			index: INDEXABLE_COIN_IDS.has(id),
			follow: true,
		},
		openGraph: {
			title: t('ogTitle', { coin: coinName }),
			description: t('ogDescription', { coin: coinName }),
			url: localePath(`/coin/${id}`, locale),
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

// Static list: this runs in every page-data worker during the build, so
// calling the live market-data API here fans out enough requests to trip
// CoinGecko's rate limit and fail the build. An empty result is also fatal
// under Cache Components. The route is request-time (instant = false), so
// these are prerender hints only.
const PRERENDER_COIN_IDS = ['bitcoin', 'ethereum', 'nano']

export function generateStaticParams() {
	return PRERENDER_COIN_IDS.map((id) => ({ id }))
}

export default async function CoinDetailPage({ params }: Props) {
	const { locale, id: coinIdParam } = await params

	if (coinIdParam === 'xno') {
		permanentRedirect(localePath('/coin/nano', locale) as Route)
	}

	return <CoinDetailContent coinIdParam={coinIdParam} locale={locale} />
}

async function CoinDetailContent({ coinIdParam, locale }: { coinIdParam: string; locale: string }) {
	'use cache'
	cacheLife('hours')

	const market = await getMarketData().catch(() => null)
	const coin = market?.data.find((item) => item.id === coinIdParam)

	if (market && !coin) {
		notFound()
	}

	const pageUrl = `${SITE}${localePath(`/coin/${coinIdParam}`, locale)}`

	const queryClient = getQueryClient()

	// Prefetch the range the chart opens with so first paint skips a request
	// waterfall. This route is request-time (instant = false), so React Query
	// Date.now() bookkeeping runs per request and never during prerendering.
	// Only the default fiat can be prefetched: the visitor fiat lives in
	// localStorage, which the server cannot read, so a non-USD visitor misses
	// this entry and fetches client-side exactly as before.
	const defaultDays: ChartTimeRange = '30'
	const isXno = coinIdParam === CRYPTO_IDS.NANO
	const defaultFiat = isXno ? 'usd' : undefined
	await queryClient
		.query({
			queryKey: ['price-chart', coinIdParam, defaultDays, defaultFiat],
			queryFn: () => getPriceChart(coinIdParam, defaultDays, defaultFiat),
		})
		.catch(() => {})

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path={`/coin/${coinIdParam}`} />
				<ModernPageBackground />

				{coin ? (
					<script
						type="application/ld+json"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								'@context': 'https://schema.org',
								'@graph': [
									organizationNode(),
									websiteNode(),
									webPageNode({
										url: pageUrl,
										name: `${coin.name} (${coin.symbol.toUpperCase()}) price`,
										locale,
									}),
									breadcrumbNode(pageUrl, [
										{ name: 'Home', url: `${SITE}${localePath('/', locale)}` },
										{ name: 'Coins' },
										{ name: coin.name },
									]),
									{
										'@type': 'FinancialProduct',
										name: coin.name,
										alternateName: [coin.symbol.toUpperCase()],
										category: 'Cryptocurrency',
										url: pageUrl,
										provider: { '@id': ORGANIZATION_ID },
									},
								],
							}),
						}}
					/>
				) : null}

				<div className="space-y-8">
					<CoinSummary locale={locale} coinId={coinIdParam} />

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
