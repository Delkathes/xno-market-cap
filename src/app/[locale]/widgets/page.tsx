import type { Metadata } from 'next'

import { DEFAULT_LOCALE } from '@/lib/constants'
import { getCompareRates } from '@/lib/market-data-service'
import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { env } from '@/env'

import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'
import { WidgetBuilder } from '@/components/widgets/widget-builder'
import { isStablecoinSymbol, isWidgetLocale, WIDGET_MESSAGES } from '@/components/widgets/widget-registry'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const strings = (await WIDGET_MESSAGES[isWidgetLocale(locale) ? locale : DEFAULT_LOCALE]()).default

	return {
		title: strings.title,
		description: strings.sub,
		openGraph: {
			title: strings.title,
			description: strings.sub,
			url: '/widgets',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/widgets', locale),
		},
	}
}

export default async function WidgetsPage({ params }: Props) {
	const { locale } = await params
	const strings = (await WIDGET_MESSAGES[isWidgetLocale(locale) ? locale : DEFAULT_LOCALE]()).default

	// All pickable cryptos for the "value in crypto" picker: the compare list
	// (top-100, already excludes Nano) minus stablecoins.
	const compareRates = await getCompareRates().catch(() => null)
	const pickableCoins = (compareRates?.coins ?? [])
		.filter((coin) => !isStablecoinSymbol(coin.symbol))
		.map((coin) => ({ symbol: coin.symbol, name: coin.name, marketCapRank: coin.marketCapRank }))

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/widgets" />
			<ModernPageBackground />

			<WidgetBuilder strings={strings} siteUrl={env.NEXT_PUBLIC_SITE_URL} pickableCoins={pickableCoins} />
		</main>
	)
}
