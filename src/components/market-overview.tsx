'use client'

import { useState } from 'react'
import { useAtom } from 'jotai'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import { cryptoCurrencyAtom, primaryFiatAtom, secondaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatFiatPrice,
	formatMarketCap,
	getFiatRate,
	getPriceChange,
	type PriceChange24h,
} from '@/lib/currency-helpers'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencySettingsPopover } from '@/components/currency-settings-popover'
import { MarketDataError } from '@/components/market-data-error'

export function MarketOverview() {
	const t = useTranslations('home')

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
		isLoading,
		error,
	} = useMarketData()

	const [showSatoshi, setShowSatoshi] = useState(true)

	const [primaryFiat] = useAtom(primaryFiatAtom)
	const [secondaryFiat] = useAtom(secondaryFiatAtom)
	const [cryptoCurrency] = useAtom(cryptoCurrencyAtom)

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i}>
						<CardContent className="p-6 space-y-3">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-32" />
							<div className="flex gap-3">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-16" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

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

	const formatCryptoPrice = () => {
		if (!selectedCrypto) return '—'
		if (selectedCrypto.id === CRYPTO_IDS.BITCOIN) {
			return showSatoshi
				? `${Math.round(xnoPriceCrypto * 1e8).toLocaleString()} sats`
				: `${xnoPriceCrypto.toFixed(8)} BTC`
		}
		// For other cryptos, show appropriate decimals
		return `${xnoPriceCrypto.toFixed(6)} ${selectedCrypto.symbol.toUpperCase()}`
	}

	const formatMarketCapInCrypto = () => {
		if (!selectedCrypto) return '—'
		if (selectedCrypto.id === CRYPTO_IDS.BITCOIN) {
			return showSatoshi
				? `${Math.round(xnoMarketCapCrypto * 1e8).toLocaleString()} sats`
				: `${xnoMarketCapCrypto.toFixed(2)} BTC`
		}
		return `${xnoMarketCapCrypto.toFixed(2).toLocaleString()} ${selectedCrypto.symbol.toUpperCase()}`
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-8 gap-4">
			<Card className="group relative md:col-span-2">
				<CurrencySettingsPopover cryptoList={data} />
				<CardContent className="p-4 sm:p-6">
					<p className="text-sm text-muted-foreground mb-1">{t('xnoMarketCap')}</p>
					<p className="text-xl sm:text-2xl font-bold font-mono">
						<span className="text-md font-normal text-lg">Ӿ</span>
						{(xnoCirculatingSupply / 1e6).toFixed(2)}M
					</p>
					<div className="flex items-center gap-3 mt-2 flex-wrap">
						<p className="text-sm text-muted-foreground">
							{formatMarketCap(xnoMarketCapPrimary, primaryFiat)}
						</p>
						<p className="text-sm text-muted-foreground">
							{formatMarketCap(xnoMarketCapSecondary, secondaryFiat)}
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
								{formatMarketCapInCrypto()}
							</p>
						</button>
					</div>
				</CardContent>
			</Card>

			<Card className="group relative md:col-span-4">
				<CurrencySettingsPopover cryptoList={data} />
				<CardContent className="p-4 sm:p-6">
					<p className="text-sm text-muted-foreground mb-1">{t('xnoPrice')} • 24h %</p>
					{xnoData && selectedCrypto && (
						<div className="grid grid-cols-3 gap-x-1 sm:gap-x-4 gap-y-1">
							{/* Row 1: Prices */}
							<span className="text-xl sm:text-2xl font-bold font-mono">
								{formatFiatPrice(xnoPricePrimary, primaryFiat)}
							</span>
							<span className="text-xl sm:text-2xl font-bold font-mono">
								{formatFiatPrice(xnoPriceSecondary, secondaryFiat)}
							</span>
							<button className="text-left" type="button" onClick={() => setShowSatoshi(!showSatoshi)}>
								<span className="text-xl sm:text-2xl font-bold font-mono cursor-pointer line-clamp-1 hover:text-primary transition-colors">
									{formatCryptoPrice()}
								</span>
							</button>

							{/* Row 2: 24h variations */}
							<div className="flex items-center gap-1">
								{xnoPriceChangePrimary >= 0 ? (
									<TrendingUp className="w-4 h-4 text-constructive" />
								) : (
									<TrendingDown className="w-4 h-4 text-destructive" />
								)}
								<span
									className={
										xnoPriceChangePrimary >= 0
											? 'text-constructive text-sm'
											: 'text-destructive text-sm'
									}
								>
									{xnoPriceChangePrimary.toFixed(2)}%
								</span>
							</div>

							<div className="flex items-center gap-1">
								{xnoPriceChangeSecondary >= 0 ? (
									<TrendingUp className="w-4 h-4 text-constructive" />
								) : (
									<TrendingDown className="w-4 h-4 text-destructive" />
								)}
								<span
									className={
										xnoPriceChangeSecondary >= 0
											? 'text-constructive text-sm'
											: 'text-destructive text-sm'
									}
								>
									{xnoPriceChangeSecondary.toFixed(2)}%
								</span>
							</div>

							<div className="flex items-center gap-1">
								{xnoPriceChangeCrypto >= 0 ? (
									<TrendingUp className="w-4 h-4 text-constructive" />
								) : (
									<TrendingDown className="w-4 h-4 text-destructive" />
								)}
								<span
									className={
										xnoPriceChangeCrypto >= 0
											? 'text-constructive text-sm'
											: 'text-destructive text-sm'
									}
								>
									{xnoPriceChangeCrypto.toFixed(2)}%
								</span>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardContent className="p-4 sm:p-6">
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
