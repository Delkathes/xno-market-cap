'use client'

import Image from 'next/image'
import { memo, useState } from 'react'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'
import { type ExchangeRates, formatSmartPrice as formatPrice, getFiatRate } from '@/lib/currency-helpers'
import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketDataError } from '@/components/market-data-error'

interface SpeculationRowProps {
	crypto: CryptoData
	formatMarketCap: (mcUSD: number) => string
	formatPrice: (priceInFiat: number) => string
	multiplier: number
	xnoPriceIf: number
}

const SpeculationRow = memo(function SpeculationRow({
	crypto,
	formatMarketCap,
	formatPrice,
	multiplier,
	xnoPriceIf,
}: SpeculationRowProps) {
	return (
		<tr className="border-b border-border hover:bg-muted/50 transition-colors">
			<td className="p-4">
				<span className="font-medium text-sm sm:text-base">{crypto.market_cap_rank}</span>
			</td>
			<td className="p-4 pl-0 sm:pl-4">
				<div className="flex items-center gap-3">
					<Image
						src={crypto.image || '/placeholder.svg'}
						alt={crypto.name}
						width={32}
						height={32}
						className="w-6 h-6 sm:w-8 sm:h-8"
					/>
					<div>
						<p className="font-semibold text-sm sm:text-base line-clamp-3">{crypto.name}</p>
						<p className="text-xs sm:text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
					</div>
				</div>
			</td>
			<td className="p-4 text-right font-mono text-sm sm:text-base text-muted-foreground">
				{formatMarketCap(crypto.market_cap)}
			</td>
			<td className="p-4 text-right">
				<span className="font-mono font-bold text-sm sm:text-base text-primary">{formatPrice(xnoPriceIf)}</span>
			</td>
			<td className="p-4 text-right">
				<span
					className={cn(
						'font-mono font-medium text-sm sm:text-base px-2 py-1 rounded',
						multiplier >= 100
							? 'bg-accent/20 text-accent'
							: multiplier >= 10
								? 'bg-primary/20 text-primary'
								: 'bg-muted text-muted-foreground',
					)}
				>
					{`${multiplier.toFixed(1)}×`}
				</span>
			</td>
		</tr>
	)
})

export function SpeculationTable() {
	const [currency, setCurrency] = useState<FiatCurrency>(FiatCurrency.USD)
	const {
		data,
		xnoData,
		xnoCirculatingSupply,
		eurRate,
		gbpRate,
		jpyRate,
		chfRate,
		cadRate,
		audRate,
		isLoading,
		error,
	} = useMarketData()

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
	const rate = getFiatRate(currency, rates)
	const { symbol } = FIAT_CURRENCY_CONFIG[currency]

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{[...Array(10)].map((_, _i) => (
							<div key={`${_}-speculation-loading`} className="h-16 animate-pulse bg-muted rounded" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error || !data) {
		return (
			<Card>
				<CardContent className="p-6">
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	const currentXnoPriceUSD = xnoData?.current_price || 0
	const currentXnoPrice = currentXnoPriceUSD * rate

	const otherCryptos = data.filter((c) => c.id !== CRYPTO_IDS.NANO).sort((a, b) => b.market_cap - a.market_cap)

	const formatPriceValue = (priceInFiat: number) => formatPrice(priceInFiat, currency)

	const formatMarketCap = (mcUSD: number) => {
		const mc = mcUSD * rate
		if (mc >= 1e12) return `${symbol}${(mc / 1e12).toFixed(2)}T`
		if (mc >= 1e9) return `${symbol}${(mc / 1e9).toFixed(2)}B`
		return `${symbol}${(mc / 1e6).toFixed(2)}M`
	}

	return (
		<Card className="relative">
			<div className="absolute -top-12 right-0">
				<Select value={currency} onValueChange={(v) => setCurrency(v as FiatCurrency)}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Select currency" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(FIAT_CURRENCY_CONFIG).map(([key, { symbol: sym, label }]) => (
							<SelectItem key={key} value={key}>
								{sym} {label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-muted-foreground text-sm whitespace-nowrap">
								<th className="text-left p-4 font-medium">#</th>
								<th className="text-left p-4 pl-0 sm:pl-4 font-medium">Name</th>
								<th className="text-right p-4 font-medium">Market Cap</th>
								<th className="text-right p-4 font-medium">XNO Price</th>
								<th className="text-right p-4 font-medium">Multiplier</th>
							</tr>
						</thead>
						<tbody>
							{otherCryptos?.map((crypto) => {
								const marketCapInFiat = crypto.market_cap * rate
								const xnoPriceIf = marketCapInFiat / xnoCirculatingSupply
								const multiplier = currentXnoPrice > 0 ? xnoPriceIf / currentXnoPrice : 0

								return (
									<SpeculationRow
										key={crypto.id}
										crypto={crypto}
										formatMarketCap={formatMarketCap}
										formatPrice={formatPriceValue}
										multiplier={multiplier}
										xnoPriceIf={xnoPriceIf}
									/>
								)
							})}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}
