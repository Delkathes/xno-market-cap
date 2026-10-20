import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { getMarketData } from '@/lib/market-data-service'
import { getRecentNews } from '@/lib/news'
import { localePath, ogImage, ogLocale } from '@/lib/seo'
import { organizationNode, SITE, webPageNode, websiteNode } from '@/lib/structured-data'

import { Skeleton } from '@/components/ui/skeleton'
import { HreflangLinks } from '@/components/hreflang-links'
import { MarketCapTable } from '@/components/market-cap-table'
import MarketDataShell from '@/components/market-data-shell'
import { MarketOverview } from '@/components/market-overview'
import { ModernPageBackground } from '@/components/modern-page-background'
import { NewsBanner } from '@/components/news-banner'
import { PartnerSpotlight } from '@/components/partner-spotlight'

type Props = {
	params: Promise<{ locale: string }>
}

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.home' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: localePath('/', locale),
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/', locale),
		},
	}
}

export default async function Home({ params }: Props) {
	const { locale } = await params

	return <HomeContent locale={locale} />
}

async function HomeContent({ locale }: { locale: string }) {
	'use cache'
	cacheLife('hours')

	const t = await getTranslations({ locale, namespace: 'home' })

	const [recentNews, initialMarketData] = await Promise.all([
		getRecentNews(locale, 6),
		getMarketData().catch(() => undefined),
	])

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path="/" />
				<ModernPageBackground />

				{/* Structured data for search engines; content is JSON-serialized local data, not user HTML */}
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
									url: `${SITE}${localePath('/', locale)}`,
									name: t('seoTitle'),
									locale,
									description: t('seoDescription'),
								}),
							],
						}),
					}}
				/>

				<div className="space-y-8">
					{/* Ticker tape */}
					<div className="animate-fade-in-up">
						<Suspense fallback={<TickerSkeleton />}>
							<NewsBanner articles={recentNews} />
						</Suspense>
					</div>

					{/* Market overview */}
					<div className="animate-fade-in-up space-y-4" style={{ animationDelay: '80ms' }}>
						<h1 className="sr-only">{t('marketDataTitle')}</h1>
						<Suspense fallback={<MarketOverviewSkeleton />}>
							<MarketOverview initialData={initialMarketData} />
						</Suspense>
					</div>

					{/* Sponsor channel */}
					<div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
						<PartnerSpotlight />
					</div>

					{/* Market ledger */}
					<div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
						<h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
							{t('marketLedger')}
						</h2>
						<Suspense fallback={<MarketCapTableSkeleton />}>
							<MarketCapTable />
						</Suspense>
					</div>
				</div>
			</main>
		</MarketDataShell>
	)
}

function TickerSkeleton() {
	return <Skeleton className="h-7.5 w-full rounded-md" />
}

export async function MarketOverviewSkeleton() {
	return (
		<div className="space-y-4">
			{/* Telemetry strip */}
			<div className="flex items-center gap-3 border-b border-dashed border-border pb-2">
				<Skeleton className="h-3 w-32" />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
				<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-4">
					<Skeleton className="h-4.25 w-24" />
					<div className="mt-3 grid grid-cols-3 gap-2">
						{[1, 2, 3].map((index) => (
							<div
								key={`price-cell-${index}`}
								className="rounded-md border border-border bg-muted/30 px-3 py-2.5"
							>
								<Skeleton className="h-3.75 w-10" />
								<Skeleton className="mt-1 h-5 w-full sm:h-6" />
								<div className="mt-2 space-y-1 border-t border-dashed border-border pt-1.5">
									<Skeleton className="h-3.75 w-12" />
									<Skeleton className="h-3.75 w-12" />
									<Skeleton className="h-3.75 w-12" />
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-2">
					<Skeleton className="h-4.25 w-24" />
					<Skeleton className="mt-2 h-9 w-32" />
					<div className="mt-4 space-y-1.5 border-t border-border pt-3">
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-full" />
					</div>
				</div>
				<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-2">
					<Skeleton className="h-4.25 w-28" />
					<div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
						{[1, 2, 3, 4].map((index) => (
							<div key={`dom-${index}`}>
								<Skeleton className="h-5 w-16" />
								<Skeleton className="mt-1.5 h-1 w-full" />
								<div className="mt-2 border-t border-dashed border-border pt-1.5">
									<Skeleton className="h-3.75 w-16" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Milestone band */}
			<div className="rounded-md border bg-card p-4 sm:p-5">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-36" />
					<Skeleton className="h-3 w-20" />
				</div>
				<Skeleton className="mt-3 h-8 w-40" />
				<Skeleton className="mt-4 h-3 w-full" />
				<Skeleton className="mt-4 h-3 w-1/3" />
				<div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
		</div>
	)
}

function MarketCapTableSkeleton() {
	return (
		<div className="relative max-h-150 overflow-auto rounded-md border border-border bg-card">
			<table className="w-full">
				<thead className="sticky top-0 z-10 border-b border-border bg-card">
					<tr className="text-foreground text-sm">
						<th className="px-3 py-2 text-left">
							<Skeleton className="h-3 w-8" />
						</th>
						<th className="px-3 py-2 pl-0 text-left sm:pl-4">
							<Skeleton className="h-3 w-12" />
						</th>
						{[1, 2, 3, 4, 5, 6].map((column) => (
							<th key={column} className="px-3 py-2 text-right">
								<Skeleton className="ml-auto h-3 w-16" />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((row) => (
						<tr key={row} className="border-b border-border">
							<td className="px-3 py-1.5">
								<Skeleton className="h-4 w-6" />
							</td>
							<td className="px-3 py-1.5 pl-0 sm:pl-4">
								<div className="flex items-center gap-3">
									<Skeleton className="h-6 w-6 rounded-full sm:h-7 sm:w-7" />
									<div className="space-y-1.5">
										<Skeleton className="h-4 w-28" />
										<Skeleton className="h-2.5 w-12" />
									</div>
								</div>
							</td>
							{[1, 2, 3, 4, 5, 6].map((cell) => (
								<td key={cell} className="px-3 py-1.5 text-right">
									<Skeleton className="ml-auto h-4 w-16" />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
