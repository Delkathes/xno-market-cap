import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { ExplorerSearch } from '@/components/explore/explorer-search'
import { LiveTicker } from '@/components/explore/live-ticker'
import { MoreTools } from '@/components/explore/more-tools'
import { NetworkStats } from '@/components/explore/network-stats'
import { QuickEntries } from '@/components/explore/quick-entries'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.explore' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/explore',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/explore', locale),
		},
	}
}

export default async function ExplorePage({ params }: Props) {
	'use cache'
	// Revalidate with the telemetry so the stats strip tracks the network;
	// the shell stays statically cached, the data refreshes every 5 minutes.
	cacheLife({ revalidate: 300 })

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'explore' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/explore" />
			<ModernPageBackground />

			<header className="mb-10 animate-fade-in-up text-center">
				<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('kicker')}
				</div>
				<h1 className="mt-3 mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">{t('h1')}</h1>
				<p className="mx-auto max-w-xl text-muted-foreground">{t('intro')}</p>
			</header>

			<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<ExplorerSearch locale={locale} />
			</div>

			<div className="mt-6 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
				<NetworkStats locale={locale} />
			</div>

			<div className="mt-6 grid animate-fade-in-up gap-6 lg:grid-cols-3" style={{ animationDelay: '240ms' }}>
				<QuickEntries locale={locale} variant="accounts" />
				<QuickEntries locale={locale} variant="artifacts" />
				<MoreTools locale={locale} />
			</div>

			<div className="mx-auto mt-6 max-w-2xl animate-fade-in-up" style={{ animationDelay: '320ms' }}>
				<LiveTicker locale={locale} />
			</div>
		</main>
	)
}
