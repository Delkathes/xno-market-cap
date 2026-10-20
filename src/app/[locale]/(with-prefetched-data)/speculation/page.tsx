import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Skeleton } from '@/components/ui/skeleton'
import { HreflangLinks } from '@/components/hreflang-links'
import MarketDataShell from '@/components/market-data-shell'
import { ModernPageBackground } from '@/components/modern-page-background'
import { SpeculationTable } from '@/components/speculation-table'

type Props = {
	params: Promise<{ locale: string }>
}

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.speculation' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: localePath('/speculation', locale),
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/speculation', locale),
		},
	}
}

export default async function SpeculationPage({ params }: Props) {
	const { locale } = await params

	return <SpeculationContent locale={locale} />
}

async function SpeculationContent({ locale }: { locale: string }) {
	'use cache'
	cacheLife('hours')

	const t = await getTranslations({ locale, namespace: 'speculation' })
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path="/speculation" />
				<ModernPageBackground />

				<header className="mb-12 sm:mb-14 animate-fade-in-up">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('title')}</h1>
					<p className="text-muted-foreground text-base sm:text-lg">{t('description')}</p>
					<p className="text-xs text-muted-foreground/70 mt-3">{tDisclaimer('speculation')}</p>
				</header>

				<div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
					<Suspense fallback={<SpeculationTableSkeleton />}>
						<SpeculationTable />
					</Suspense>
				</div>
			</main>
		</MarketDataShell>
	)
}

function SpeculationTableSkeleton() {
	return (
		<div className="rounded-md border bg-card p-4">
			<div className="flex items-center justify-between gap-4">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-7 w-36" />
			</div>
			<div className="mt-4 space-y-2.5">
				{[1, 2, 3, 4, 5, 6].map((row) => (
					<div key={row} className="flex items-center gap-4">
						<Skeleton className="h-4 w-6" />
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-4 w-32" />
						<div className="ml-auto hidden gap-8 sm:flex">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-14" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
