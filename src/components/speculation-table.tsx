'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS, FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'
import {
	type ExchangeRates,
	formatLargeNumber,
	formatSmartFiatPrice as formatPrice,
	getFiatRate,
} from '@/lib/currency-helpers'
import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketDataError } from '@/components/market-data-error'

interface SpeculationRowProps {
	crypto: CryptoData
	index: number
	formatMarketCap: (mcUSD: number) => string
	formatPrice: (priceInFiat: number) => string
	multiplier: number
	xnoPriceIf: number
}

function SpeculationRow({ crypto, index, formatMarketCap, formatPrice, multiplier, xnoPriceIf }: SpeculationRowProps) {
	return (
		<tr className="border-b border-border hover:bg-muted/50 transition-colors">
			<td className="px-3 py-2">
				<span className="font-medium text-sm sm:text-base">{crypto.market_cap_rank}</span>
			</td>
			<td className="px-3 py-2 pl-0 sm:pl-4">
				<div className="flex items-center gap-3">
					<Image
						src={crypto.image || '/placeholder.svg'}
						alt={crypto.name}
						width={32}
						height={32}
						className="w-6 h-6 sm:w-8 sm:h-8"
						unoptimized
					/>
					<div>
						<p className="font-semibold text-sm line-clamp-3">{crypto.name}</p>
						<p className="text-xs sm:text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
					</div>
				</div>
			</td>
			<td className="px-3 py-2 text-right font-mono text-sm text-muted-foreground font-medium">
				{formatMarketCap(crypto.market_cap)}
			</td>
			<td className="px-3 py-2 text-right">
				<span className="font-mono font-bold text-sm text-xno-value">{formatPrice(xnoPriceIf)}</span>
			</td>
			<td className="px-3 py-2 text-right">
				<span
					className={cn(
						'font-mono font-medium text-sm px-2 py-1 rounded',
						multiplier >= 100
							? 'bg-accent/20 text-accent'
							: multiplier >= 10
								? 'bg-primary/20 text-primary'
								: 'bg-muted text-muted-foreground',
					)}
				>
					{`${multiplier.toLocaleString(undefined, { maximumFractionDigits: multiplier >= 1000 ? 0 : 1 })}×`}
				</span>
			</td>
		</tr>
	)
}

export function SpeculationTable() {
	const t = useTranslations('speculation')

	const { data, xnoData, xnoCirculatingSupply, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate, error } =
		useMarketData()

	const [currency, setCurrency] = useState<FiatCurrency>(FiatCurrency.USD)

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
	const rate = getFiatRate(currency, rates)
	const { symbol } = FIAT_CURRENCY_CONFIG[currency]

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

	return (
		<div className="relative">
			<div className="absolute -top-12 right-0">
				<Select value={currency} onValueChange={(v) => setCurrency(v as FiatCurrency)}>
					<SelectTrigger className="w-40 bg-card dark:bg-card border-border">
						<SelectValue placeholder={t('selectCurrency')} />
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
			<div className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-foreground text-sm whitespace-nowrap">
								<th className="text-left px-3 py-2 font-medium">{t('rank')}</th>
								<th className="text-left px-3 py-2 pl-0 sm:pl-4 font-medium">{t('name')}</th>
								<th className="text-right px-3 py-2 font-medium">{t('marketCap')}</th>
								<th className="text-right px-3 py-2 font-medium">{t('xnoPrice')}</th>
								<th className="text-right px-3 py-2 font-medium">{t('multiplier')}</th>
							</tr>
						</thead>
						<tbody>
							{otherCryptos?.map((crypto, index) => {
								const marketCapInFiat = crypto.market_cap * rate
								const xnoPriceIf = marketCapInFiat / xnoCirculatingSupply
								const multiplier = currentXnoPrice > 0 ? xnoPriceIf / currentXnoPrice : 0

								return (
									<SpeculationRow
										key={crypto.id}
										index={index}
										crypto={crypto}
										formatMarketCap={(marketCapUSD: number) => {
											const marketCap = marketCapUSD * rate
											return `${symbol}${formatLargeNumber(marketCap)}`
										}}
										formatPrice={(priceInFiat: number) => formatPrice(priceInFiat, currency)}
										multiplier={multiplier}
										xnoPriceIf={xnoPriceIf}
									/>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
