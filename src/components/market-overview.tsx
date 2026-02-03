'use client'

import { useState } from 'react'
import { useAtom } from 'jotai'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import { cryptoCurrencyAtom, primaryFiatAtom, secondaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatCryptoMarketCap,
	formatCryptoPrice,
	formatFiatMarketCap,
	formatFiatPrice,
	formatPercentage,
	getFiatRate,
	getPriceChange,
	type PriceChange24h,
} from '@/lib/currency-helpers'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { CurrencySettingsPopover } from '@/components/currency-settings-popover'
import { MarketDataError } from '@/components/market-data-error'

export function MarketOverview() {
	const {
		data,
		xnoCirculatingSupply,
		xnoData,
		eurRate,
		gbpRate,
		jpyRate,
		chfRate,
		cadRate,
		audRate,
		xnoPriceChange24h,
		error,
	} = useMarketData()

	const t = useTranslations('home')

	const [showSatoshi, setShowSatoshi] = useState(true)

	const [primaryFiat] = useAtom(primaryFiatAtom)
	const [secondaryFiat] = useAtom(secondaryFiatAtom)
	const [cryptoCurrency] = useAtom(cryptoCurrencyAtom)

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }

	if (error || !data) {
		return <MarketDataError error={error} />
	}

	const btc = data.find((c) => c.id === CRYPTO_IDS.BITCOIN)
	const selectedCrypto = data.find((c) => c.id === cryptoCurrency) || btc

	const primaryRate = getFiatRate(primaryFiat, rates)
	const secondaryRate = getFiatRate(secondaryFiat, rates)

	const xnoMarketCapUSD = xnoData ? xnoCirculatingSupply * xnoData.current_price : 0
	const xnoMarketCapPrimary = xnoMarketCapUSD * primaryRate
	const xnoMarketCapSecondary = xnoMarketCapUSD * secondaryRate
	const xnoMarketCapCrypto = selectedCrypto ? xnoMarketCapUSD / selectedCrypto.current_price : 0

	const xnoPriceChangeUSD = xnoPriceChange24h?.usd ?? xnoData?.price_change_percentage_24h ?? 0
	const xnoPriceChangePrimary = getPriceChange(primaryFiat, xnoPriceChange24h as PriceChange24h | undefined)
	const xnoPriceChangeSecondary = getPriceChange(secondaryFiat, xnoPriceChange24h as PriceChange24h | undefined)
	const xnoPriceChangeCrypto =
		xnoData && selectedCrypto ? xnoPriceChangeUSD - (selectedCrypto.price_change_percentage_24h || 0) : 0

	const xnoPrice = xnoData?.current_price || 1
	const totalMarketCapInXNO = data?.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0
	const xnoDominance = (xnoCirculatingSupply / totalMarketCapInXNO) * 100
	const btcDominance = btc ? (btc.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	const eth = data.find((c) => c.id === CRYPTO_IDS.ETHEREUM)
	const ethDominance = eth ? (eth.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	// Others = everything except XNO, BTC, ETH
	const othersMarketCapXNO = data
		.filter((c) => c.id !== CRYPTO_IDS.NANO && c.id !== CRYPTO_IDS.BITCOIN && c.id !== CRYPTO_IDS.ETHEREUM)
		.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)
	const othersDominance = (othersMarketCapXNO / totalMarketCapInXNO) * 100

	const xnoPricePrimary = xnoData ? xnoData.current_price * primaryRate : 0
	const xnoPriceSecondary = xnoData ? xnoData.current_price * secondaryRate : 0
	const xnoPriceCrypto = xnoData && selectedCrypto ? xnoData.current_price / selectedCrypto.current_price : 0

	return (
		<div className="grid grid-cols-1 md:grid-cols-8 gap-4">
			<Card className="group relative md:col-span-2">
				<CurrencySettingsPopover cryptoList={data} />
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1">{t('xnoMarketCap')}</p>
					<p className="text-xl sm:text-2xl font-bold font-mono flex items-baseline">
						<span className="text-sm sm:text-lg">Ӿ</span>
						{(xnoCirculatingSupply / 1e6).toFixed(2)}M
					</p>
					<div className="flex items-center gap-3 mt-2 flex-wrap">
						<p className="text-sm text-muted-foreground">
							{formatFiatMarketCap(xnoMarketCapPrimary, primaryFiat)}
						</p>
						<p className="text-sm text-muted-foreground">
							{formatFiatMarketCap(xnoMarketCapSecondary, secondaryFiat)}
						</p>
						<button onClick={() => setShowSatoshi(!showSatoshi)} type="button">
							<p
								className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
								title={t('clickToToggle', {
									options:
										selectedCrypto?.id === CRYPTO_IDS.BITCOIN
											? t('betweenBtcAndSatoshi')
											: t('units'),
								})}
							>
								{!selectedCrypto
									? '—'
									: formatCryptoMarketCap(xnoMarketCapCrypto, {
											symbol: selectedCrypto.symbol,
											asSatoshi: selectedCrypto.id === CRYPTO_IDS.BITCOIN && showSatoshi,
										})}
							</p>
						</button>
					</div>
				</CardContent>
			</Card>

			<Card className="group relative md:col-span-4">
				<CurrencySettingsPopover cryptoList={data} />
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1">{t('xnoPrice')} • 24h %</p>
					{xnoData && selectedCrypto && (
						<div className="grid grid-cols-3 gap-x-1 sm:gap-x-4 gap-y-1">
							{/* Row 1: Prices */}
							<span className="text-xl sm:text-2xl font-bold font-mono w-fit">
								{formatFiatPrice(xnoPricePrimary, primaryFiat)}
							</span>
							<span className="text-xl sm:text-2xl font-bold font-mono w-fit">
								{formatFiatPrice(xnoPriceSecondary, secondaryFiat)}
							</span>
							<button className="text-left" type="button" onClick={() => setShowSatoshi(!showSatoshi)}>
								<span className="text-xl sm:text-2xl font-bold font-mono w-fit cursor-pointer line-clamp-1 hover:text-primary transition-colors">
									{!selectedCrypto
										? '—'
										: formatCryptoPrice(xnoPriceCrypto, {
												symbol: selectedCrypto.symbol,
												asSatoshi: selectedCrypto.id === CRYPTO_IDS.BITCOIN && showSatoshi,
											})}
								</span>
							</button>

							{/* Row 2: 24h variations */}
							<Change value={xnoPriceChangePrimary} />
							<Change value={xnoPriceChangeSecondary} />
							<Change value={xnoPriceChangeCrypto} />
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardContent className="p-4 sm:p-5">
					<p className="text-sm text-muted-foreground mb-1">{t('xnoDominance')}</p>
					<p className="text-xl sm:text-2xl font-bold font-mono">{xnoDominance.toFixed(4)}%</p>
					<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
						<span>
							{t('btcDominance')}: {btcDominance.toFixed(2)}%
						</span>
						<span>
							{t('ethDominance')}: {ethDominance.toFixed(2)}%
						</span>
						<span>
							{t('othersDominance')}: {othersDominance.toFixed(2)}%
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function Change({ value }: { value: number }) {
	return (
		<div className="flex items-center gap-1">
			{value >= 0 ? (
				<TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-trendup" />
			) : (
				<TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-trenddown" />
			)}
			<span className={value >= 0 ? 'text-trendup text-sm font-medium' : 'text-trenddown text-sm'}>
				{formatPercentage(value)}
			</span>
		</div>
	)
}
