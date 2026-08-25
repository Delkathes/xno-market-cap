import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getRecentNews } from '@/lib/news'

import { env } from '@/env'

import { Skeleton } from '@/components/ui/skeleton'
import { MarketCapTable } from '@/components/market-cap-table'
import { MarketOverview } from '@/components/market-overview'
import { ModernPageBackground } from '@/components/modern-page-background'
import { NewsBanner } from '@/components/news-banner'
import { PartnerSpotlight } from '@/components/partner-spotlight'

type Props = {
	params: Promise<{ locale: string }>
}

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
			url: '/',
		},
		alternates: {
			canonical: '/',
		},
	}
}

export default async function Home({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'home' })

	const recentNews = await getRecentNews(locale, 6)

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							{
								'@type': 'Organization',
								'@id': `${env.NEXT_PUBLIC_SITE_URL}/#organization`,
								name: 'NanoMarketCap',
								url: env.NEXT_PUBLIC_SITE_URL,
								logo: `${env.NEXT_PUBLIC_SITE_URL}/X_abstract.svg`,
							},
							{
								'@type': 'WebSite',
								'@id': `${env.NEXT_PUBLIC_SITE_URL}/#website`,
								url: env.NEXT_PUBLIC_SITE_URL,
								name: 'NanoMarketCap',
								publisher: { '@id': `${env.NEXT_PUBLIC_SITE_URL}/#organization` },
								inLanguage: ['en', 'nl', 'es', 'it', 'de', 'fr'],
							},
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
				<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
					<Suspense fallback={<MarketOverviewSkeleton locale={locale} />}>
						<MarketOverview />
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
	)
}

function TickerSkeleton() {
	return <Skeleton className="h-9 w-full rounded-md" />
}

export async function MarketOverviewSkeleton({ locale }: { locale: string }) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
			<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-4">
				<Skeleton className="h-3 w-24" />
				<div className="mt-3 grid grid-cols-3 gap-2">
					{[1, 2, 3].map((index) => (
						<div
							key={`price-cell-${index}`}
							className="rounded-md border border-border bg-muted/30 px-3 py-2.5"
						>
							<Skeleton className="h-3 w-10" />
							<Skeleton className="mt-2 h-6 w-full" />
							<div className="mt-2 space-y-1 border-t border-dashed border-border pt-1.5">
								<Skeleton className="h-3 w-12" />
								<Skeleton className="h-3 w-12" />
								<Skeleton className="h-3 w-12" />
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-2">
				<Skeleton className="h-3 w-24" />
				<Skeleton className="mt-2 h-8 w-32" />
				<div className="mt-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
				</div>
			</div>
			<div className="rounded-md border bg-card p-4 sm:p-5 lg:col-span-2">
				<Skeleton className="h-3 w-28" />
				<div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
					{[1, 2, 3, 4].map((index) => (
						<div key={`dom-${index}`}>
							<Skeleton className="h-4 w-16" />
							<Skeleton className="mt-2 h-1.5 w-full" />
							<div className="mt-2 border-t border-dashed border-border pt-1.5">
								<Skeleton className="h-3 w-16" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function MarketCapTableSkeleton() {
	return (
		<div className="rounded-md border border-border bg-card p-4">
			<div className="space-y-2.5">
				{[1, 2, 3, 4, 5, 6].map((row) => (
					<div key={row} className="flex items-center gap-4">
						<Skeleton className="h-4 w-6" />
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-4 w-32" />
						<div className="ml-auto hidden gap-8 sm:flex">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
