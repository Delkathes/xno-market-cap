import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { getBtcFees } from '@/lib/btc-fees'
import { CRYPTO_IDS } from '@/lib/constants'
import { getMarketData } from '@/lib/market-data-service'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'
import { FeeComparison } from '@/components/tools/fee-comparison'
import { ToolPanel } from '@/components/tools/tool-panel'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.tools.feeComparison' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/tools/fee-comparison',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/tools/fee-comparison', locale),
		},
	}
}

export default async function FeeComparisonPage({ params }: Props) {
	'use cache'
	cacheLife('hours')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'tools.feeComparison' })

	let fees: Awaited<ReturnType<typeof getBtcFees>> | null = null
	let xnoUsd = 0
	let btcUsd = 0
	const [feesResult, marketResult] = await Promise.allSettled([getBtcFees(), getMarketData()])
	if (feesResult.status === 'fulfilled') {
		fees = feesResult.value
	} else {
		console.error('Failed to fetch BTC fees:', feesResult.reason)
	}
	if (marketResult.status === 'fulfilled') {
		xnoUsd = marketResult.value.xnoData?.current_price ?? 0
		const btc = marketResult.value.data.find((coin) => coin.id === CRYPTO_IDS.BITCOIN)
		btcUsd = btc?.current_price ?? 0
	} else {
		console.error('Failed to fetch market data for fee comparison:', marketResult.reason)
	}

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/tools/fee-comparison" />
			<ModernPageBackground />

			<header className="mb-10 animate-fade-in-up">
				<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('kicker')}
				</div>
				<h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
			</header>

			<div className="max-w-3xl animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<ToolPanel index="05" title={t('h1')} sub={t('sub')}>
					{fees && btcUsd > 0 ? (
						<FeeComparison fees={fees} xnoUsd={xnoUsd} btcUsd={btcUsd} />
					) : (
						<p className="text-sm text-muted-foreground">{t('sub')}</p>
					)}
				</ToolPanel>
			</div>
		</main>
	)
}
