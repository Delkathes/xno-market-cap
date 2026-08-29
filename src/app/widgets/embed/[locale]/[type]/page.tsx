import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { getAccountData } from '@/lib/account-data-service'
import type { ExchangeRates } from '@/lib/currency-helpers'
import { getMarketData } from '@/lib/market-data-service'
import { isValidNanoAddress } from '@/lib/nano-utils'
import { getNetworkStats } from '@/lib/network-stats-service'

import { env } from '@/env'

import { AccountWidget } from '@/components/widgets/account-widget'
import { CalculatorWidget } from '@/components/widgets/calculator-widget'
import { DonateWidget } from '@/components/widgets/donate-widget'
import { LiveWidget } from '@/components/widgets/live-widget'
import { MarketCapWidget, PriceWidget } from '@/components/widgets/market-widgets'
import { NetworkWidget } from '@/components/widgets/network-widget'
import {
	DEFAULT_CRYPTOS,
	defaultSecondaryFiats,
	isStablecoinSymbol,
	isWidgetLocale,
	isWidgetType,
	parseWidgetParams,
	WIDGET_MESSAGES,
	type WidgetLocale,
	type WidgetParams,
	type WidgetStrings,
	type WidgetType,
} from '@/components/widgets/widget-registry'

export const metadata: Metadata = {
	robots: { index: false, follow: false },
}

// searchParams-dynamic: request-time only, never statically prerendered.
export const instant = false

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

type Props = {
	params: Promise<{ locale: string; type: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WidgetEmbedPage({ params, searchParams }: Props) {
	await connection()

	const { locale, type } = await params
	if (!isWidgetLocale(locale) || !isWidgetType(type)) notFound()

	const search = await searchParams
	const address = typeof search.address === 'string' ? search.address : ''

	return <WidgetContent locale={locale} type={type} params={parseWidgetParams(search)} address={address} />
}

// Cached per (locale, type, params, address) combo: 100 embeds share one
// render. The data services underneath are cached too, so this never touches
// the relays or CoinGecko per visitor.
async function WidgetContent({
	locale,
	type,
	params,
	address,
}: {
	locale: WidgetLocale
	type: WidgetType
	params: WidgetParams
	address: string
}) {
	'use cache'
	cacheLife('minutes')

	const strings = (await WIDGET_MESSAGES[locale]()).default as WidgetStrings

	switch (type) {
		case 'price':
		case 'market-cap':
		case 'calculator': {
			const marketData = await getMarketData().catch(() => null)
			if (!marketData) return <Unavailable key="unavailable" strings={strings} />
			const secondaryFiats = params.secondaryFiats ?? defaultSecondaryFiats(params.currency)
			// The value is also shown in picked cryptos (top-10 assets).
			const cryptos = (params.cryptos ?? DEFAULT_CRYPTOS)
				.map((symbol) =>
					marketData.data.find(
						(entry) =>
							entry.symbol.toUpperCase() === symbol &&
							!isStablecoinSymbol(symbol) &&
							entry.current_price > 0,
					),
				)
				.filter((entry): entry is (typeof marketData.data)[number] => entry !== undefined)
				.map((entry) => ({ symbol: entry.symbol.toUpperCase(), usdPrice: entry.current_price }))
			const bitcoin = marketData.data.find((entry) => entry.id === 'bitcoin')
			if (type === 'price') {
				return (
					<PriceWidget
						key="price"
						t={strings}
						params={params}
						locale={locale}
						marketData={marketData}
						fiats={secondaryFiats}
						cryptos={cryptos}
					/>
				)
			}
			if (type === 'market-cap') {
				// The "at BTC's cap" mode needs BTC in the display cryptos.
				const mcParams =
					params.cryptos === null || params.cryptos.includes('BTC')
						? params
						: { ...params, variant: 'normal' as const }
				return (
					<MarketCapWidget
						key="market-cap"
						t={strings}
						params={mcParams}
						locale={locale}
						marketData={marketData}
						fiats={secondaryFiats}
						cryptos={cryptos}
						bitcoinMarketCap={bitcoin?.market_cap ?? null}
					/>
				)
			}
			return (
				<CalculatorWidget
					key="calculator"
					t={strings}
					currency={params.currency}
					priceUsd={marketData.xnoData.current_price}
					rates={marketData as ExchangeRates}
					locale={locale}
					fiats={secondaryFiats}
					cryptos={cryptos}
					compact={params.compact}
				/>
			)
		}
		case 'network': {
			const network = await getNetworkStats().catch(() => null)
			if (!network) return <Unavailable key="unavailable" strings={strings} />
			return <NetworkWidget key="network" t={strings} data={network} locale={locale} compact={params.compact} />
		}
		case 'account': {
			if (!isValidNanoAddress(address)) return <Unavailable key="unavailable" strings={strings} />
			const result = await getAccountData(address)
			if (!result.ok) return <Unavailable key="unavailable" strings={strings} />
			const marketData = await getMarketData().catch(() => null)
			const priceUsd = marketData?.xnoData.current_price ?? 0
			const secondaryFiats = params.secondaryFiats ?? defaultSecondaryFiats(params.currency)
			const cryptos = (params.cryptos ?? DEFAULT_CRYPTOS)
				.map((symbol) =>
					marketData?.data.find(
						(entry) =>
							entry.symbol.toUpperCase() === symbol &&
							!isStablecoinSymbol(symbol) &&
							entry.current_price > 0,
					),
				)
				.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
				.map((entry) => ({ symbol: entry.symbol.toUpperCase(), usdPrice: entry.current_price }))
			return (
				<AccountWidget
					key="account"
					t={strings}
					data={result.data}
					priceUsd={priceUsd}
					rates={marketData as ExchangeRates}
					currency={params.currency}
					locale={locale}
					fiats={secondaryFiats}
					cryptos={cryptos}
					compact={params.compact}
				/>
			)
		}
		case 'live':
			return <LiveWidget key="live" t={strings} siteUrl={SITE_URL} locale={locale} compact={params.compact} />
		case 'donate': {
			if (!isValidNanoAddress(address)) return <Unavailable key="unavailable" strings={strings} />
			return <DonateWidget key="donate" t={strings} address={address} compact={params.compact} />
		}
		default:
			notFound()
	}
}

function Unavailable({ strings }: { strings: WidgetStrings }) {
	return (
		<div className="flex h-full min-h-[120px] w-full items-center justify-center rounded-md border border-dashed border-border bg-card px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
			{strings.unavailable}
		</div>
	)
}
