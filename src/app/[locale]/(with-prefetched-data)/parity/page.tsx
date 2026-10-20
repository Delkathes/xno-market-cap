import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Skeleton } from '@/components/ui/skeleton'
import { HreflangLinks } from '@/components/hreflang-links'
import MarketDataShell from '@/components/market-data-shell'
import { ModernPageBackground } from '@/components/modern-page-background'
import { ParityHighlight } from '@/components/parity-highlight'
import { ParitySettingsPopover, ParityTable } from '@/components/parity-table'

type Props = {
	params: Promise<{ locale: string }>
}

export const instant = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.parity' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: localePath('/parity', locale),
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/parity', locale),
		},
	}
}

function SectionHeader({
	index,
	title,
	description,
	action,
}: {
	index: string
	title: string
	description?: string
	action?: React.ReactNode
}) {
	return (
		<div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
			<div className="flex items-baseline gap-3 min-w-0">
				<span className="font-mono text-sm text-muted-foreground/60 tabular-nums tracking-widest select-none">
					{index}
				</span>
				<div className="min-w-0">
					<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-balance">{title}</h2>
					{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
				</div>
			</div>
			{action && <div className="flex-none absolute right-0 top-0">{action}</div>}
		</div>
	)
}

export default async function ParityPage({ params }: Props) {
	const { locale } = await params

	return <ParityContent locale={locale} />
}

async function ParityContent({ locale }: { locale: string }) {
	'use cache'
	cacheLife('hours')

	const t = await getTranslations({ locale, namespace: 'parity' })
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<MarketDataShell>
			<main className="relative isolate container mx-auto px-4 py-8">
				<HreflangLinks path="/parity" />
				<ModernPageBackground />

				<header className="mb-12 sm:mb-14 animate-fade-in-up">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('title')}</h1>
					<p className="text-muted-foreground text-base sm:text-lg">{t('description')}</p>
					<p className="text-xs text-muted-foreground/70 mt-3">{tDisclaimer('parity')}</p>
				</header>

				<div className="grid gap-10">
					{/* 01 — Highlight */}
					<section className="animate-fade-in-up">
						<Suspense
							fallback={
								<>
									<SectionHeader
										index="01"
										title={t('nanoScarcityParity')}
										description={t('description')}
									/>
									<div className="rounded-md border bg-card p-4 sm:p-6">
										<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
											{[1, 2, 3, 4, 5].map((index) => (
												<Skeleton key={`highlight-${index}`} className="h-24 rounded-md" />
											))}
										</div>
									</div>
								</>
							}
						>
							<SectionHeader
								index="01"
								title={t('nanoScarcityParity')}
								description={t('description')}
								action={<ParitySettingsPopover />}
							/>
							<div className="rounded-md border bg-card p-4 sm:p-6">
								<ParityHighlight />
							</div>
						</Suspense>
					</section>

					{/* 02 — Matrix */}
					<section className="animate-fade-in-up min-w-0" style={{ animationDelay: '120ms' }}>
						<Suspense
							fallback={
								<>
									<SectionHeader
										index="02"
										title={t('scarcityParityMatrix')}
										description={t('tableDescription')}
									/>
									<div className="rounded-md border bg-card p-4">
										<div className="space-y-2.5">
											{[1, 2, 3, 4, 5, 6].map((row) => (
												<div key={row} className="flex items-center gap-4">
													<Skeleton className="h-8 w-8 rounded-full" />
													<Skeleton className="h-4 w-28" />
													<div className="ml-auto flex gap-10">
														<Skeleton className="h-4 w-20" />
														<Skeleton className="h-4 w-20" />
														<Skeleton className="h-4 w-20" />
													</div>
												</div>
											))}
										</div>
									</div>
								</>
							}
						>
							<SectionHeader
								index="02"
								title={t('scarcityParityMatrix')}
								description={t('tableDescription')}
								action={<ParitySettingsPopover />}
							/>
							<ParityTable />
						</Suspense>
					</section>

					{/* 03 — Key Takeaway */}
					<section className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
						<SectionHeader index="03" title={t('keyTakeaway')} />
						<div className="rounded-md border bg-card p-4 sm:p-6">
							<p className="text-sm text-muted-foreground mb-5 leading-relaxed">
								{t.rich('keyTakeawayText', {
									highlight: (chunks) => (
										<span className="text-foreground font-medium">{chunks}</span>
									),
								})}
							</p>
							<blockquote className="border-l-2 border-[#209CE9] pl-4 italic text-foreground leading-relaxed">
								{t('blockquote')}
							</blockquote>
						</div>
					</section>
				</div>
			</main>
		</MarketDataShell>
	)
}
