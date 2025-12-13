'use client'

import { useState } from 'react'
import { useAtom } from 'jotai'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { XNO_CIRCULATING_SUPPLY } from '@/lib/constants'
import {
	cryptoCurrencyAtom,
	FIAT_CURRENCY_CONFIG,
	type FiatCurrency,
	primaryFiatAtom,
	secondaryFiatAtom,
} from '@/lib/currency-atoms'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencySettingsPopover } from '@/components/currency-settings-popover'
import { MarketDataError } from '@/components/market-data-error'

export function MarketOverview() {
	const { data, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate, isLoading, error } = useMarketData()
	const [showSatoshi, setShowSatoshi] = useState(true)

	const [primaryFiat] = useAtom(primaryFiatAtom)
	const [secondaryFiat] = useAtom(secondaryFiatAtom)
	const [cryptoCurrency] = useAtom(cryptoCurrencyAtom)

	const getRate = (currency: FiatCurrency): number => {
		switch (currency) {
			case 'EUR':
				return eurRate ?? 1
			case 'GBP':
				return gbpRate ?? 1
			case 'JPY':
				return jpyRate ?? 1
			case 'CHF':
				return chfRate ?? 1
			case 'CAD':
				return cadRate ?? 1
			case 'AUD':
				return audRate ?? 1
			default:
				return 1
		}
	}

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

	const xno = data.find((c) => c.id === 'nano')
	const btc = data.find((c) => c.id === 'bitcoin')
	const selectedCrypto = data.find((c) => c.id === cryptoCurrency) || btc

	const primaryRate = getRate(primaryFiat)
	const secondaryRate = getRate(secondaryFiat)
	const primarySymbol = FIAT_CURRENCY_CONFIG[primaryFiat].symbol
	const secondarySymbol = FIAT_CURRENCY_CONFIG[secondaryFiat].symbol

	const xnoMarketCapUSD = xno ? XNO_CIRCULATING_SUPPLY * xno.current_price : 0
	const xnoMarketCapPrimary = xnoMarketCapUSD * primaryRate
	const xnoMarketCapSecondary = xnoMarketCapUSD * secondaryRate
	const xnoMarketCapCrypto = selectedCrypto ? xnoMarketCapUSD / selectedCrypto.current_price : 0

	const formatMarketCap = (value: number, symbol: string, isJpy = false) => {
		if (isJpy) {
			return value >= 1e12 ? `${symbol}${(value / 1e12).toFixed(2)}T` : `${symbol}${(value / 1e9).toFixed(0)}B`
		}
		return value >= 1e9 ? `${symbol}${(value / 1e9).toFixed(2)}B` : `${symbol}${(value / 1e6).toFixed(2)}M`
	}

	const xnoPriceChangeUSD = xno?.price_change_percentage_24h || 0
	const xnoPriceChangePrimary = xnoPriceChangeUSD
	const xnoPriceChangeSecondary = xnoPriceChangeUSD
	const xnoPriceChangeCrypto =
		xno && selectedCrypto ? xnoPriceChangeUSD - (selectedCrypto.price_change_percentage_24h || 0) : 0

	const xnoPrice = xno?.current_price || 1
	const totalMarketCapInXNO = data?.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0
	const xnoDominance = (XNO_CIRCULATING_SUPPLY / totalMarketCapInXNO) * 100
	const btcDominance = btc ? (btc.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	const eth = data.find((c) => c.id === 'ethereum')
	const ethDominance = eth ? (eth.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	// Others = everything except XNO, BTC, ETH
	const othersMarketCapXNO = data
		.filter((c) => c.id !== 'nano' && c.id !== 'bitcoin' && c.id !== 'ethereum')
		.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)
	const othersDominance = (othersMarketCapXNO / totalMarketCapInXNO) * 100

	const xnoPricePrimary = xno ? xno.current_price * primaryRate : 0
	const xnoPriceSecondary = xno ? xno.current_price * secondaryRate : 0
	const xnoPriceCrypto = xno && selectedCrypto ? xno.current_price / selectedCrypto.current_price : 0

	const formatPrice = (value: number, symbol: string, isJpy = false) => {
		if (isJpy) return `${symbol}${value.toFixed(0)}`
		return `${symbol}${value.toFixed(2)}`
	}

	const formatCryptoPrice = () => {
		if (!selectedCrypto) return '—'
		if (selectedCrypto.id === 'bitcoin') {
			return showSatoshi
				? `${Math.round(xnoPriceCrypto * 1e8).toLocaleString()} sats`
				: `${xnoPriceCrypto.toFixed(8)} BTC`
		}
		// For other cryptos, show appropriate decimals
		return `${xnoPriceCrypto.toFixed(6)} ${selectedCrypto.symbol.toUpperCase()}`
	}

	const formatCryptoMarketCap = () => {
		if (!selectedCrypto) return '—'
		if (selectedCrypto.id === 'bitcoin') {
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
					<p className="text-sm text-muted-foreground mb-1">XNO Market Cap</p>
					<p className="text-xl sm:text-2xl font-bold font-mono">
						<span className="text-md font-normal text-lg">Ӿ</span>
						{(XNO_CIRCULATING_SUPPLY / 1e6).toFixed(2)}M
					</p>
					<div className="flex items-center gap-3 mt-2 flex-wrap">
						<p className="text-sm text-muted-foreground">
							{formatMarketCap(xnoMarketCapPrimary, primarySymbol, primaryFiat === 'JPY')}
						</p>
						<p className="text-sm text-muted-foreground">
							{formatMarketCap(xnoMarketCapSecondary, secondarySymbol, secondaryFiat === 'JPY')}
						</p>
						<button onClick={() => setShowSatoshi(!showSatoshi)} type="button">
							<p
								className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
								title={`Click to toggle ${selectedCrypto?.id === 'bitcoin' ? 'between BTC and satoshi' : 'units'}`}
							>
								{formatCryptoMarketCap()}
							</p>
						</button>
					</div>
				</CardContent>
			</Card>

			<Card className="group relative md:col-span-4">
				<CurrencySettingsPopover cryptoList={data} />
				<CardContent className="p-4 sm:p-6">
					<p className="text-sm text-muted-foreground mb-1">XNO Price • 24h %</p>
					{xno && selectedCrypto && (
						<div className="grid grid-cols-3 gap-x-1 sm:gap-x-4 gap-y-1">
							{/* Row 1: Prices */}
							<span className="text-xl sm:text-2xl font-bold font-mono">
								{formatPrice(xnoPricePrimary, primarySymbol, primaryFiat === 'JPY')}
							</span>
							<span className="text-xl sm:text-2xl font-bold font-mono">
								{formatPrice(xnoPriceSecondary, secondarySymbol, secondaryFiat === 'JPY')}
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
					<p className="text-sm text-muted-foreground mb-1">XNO Dominance</p>
					<p className="text-xl sm:text-2xl font-bold font-mono">{xnoDominance.toFixed(4)}%</p>
					<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
						<span>BTC: {btcDominance.toFixed(2)}%</span>
						<span>ETH: {ethDominance.toFixed(2)}%</span>
						<span>Others: {othersDominance.toFixed(2)}%</span>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
