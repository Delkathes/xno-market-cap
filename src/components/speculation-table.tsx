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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketDataError } from '@/components/market-data-error'

interface SpeculationRowProps {
	crypto: CryptoData
	formatMarketCap: (mcUSD: number) => string
	formatPrice: (priceInFiat: number) => string
	multiplier: number
	xnoPriceIf: number
}

function SpeculationRow({ crypto, formatMarketCap, formatPrice, multiplier, xnoPriceIf }: SpeculationRowProps) {
	return (
		<tr className="border-b border-border transition-colors hover:bg-muted/40">
			<td className="px-3 py-1.5">
				<span className="font-medium tabular-nums text-sm sm:text-base">{crypto.market_cap_rank}</span>
			</td>
			<td className="px-3 py-1.5 pl-0 sm:pl-4">
				<div className="flex items-center gap-3">
					<Image
						src={crypto.image || '/placeholder.svg'}
						alt={crypto.name}
						width={32}
						height={32}
						className="w-6 h-6 sm:w-7 sm:h-7"
						unoptimized
					/>
					<div>
						<p className="font-semibold text-sm line-clamp-1">{crypto.name}</p>
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							{crypto.symbol}
						</p>
					</div>
				</div>
			</td>
			<td className="px-3 py-1.5 text-right font-mono text-sm font-medium tabular-nums text-muted-foreground">
				{formatMarketCap(crypto.market_cap)}
			</td>
			<td className="px-3 py-1.5 text-right">
				<span className="font-mono font-bold text-sm tabular-nums text-xno-value">
					{formatPrice(xnoPriceIf)}
				</span>
			</td>
			<td className="px-3 py-1.5 text-right">
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
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<MarketDataError error={error} compact />
			</div>
		)
	}

	const currentXnoPriceUSD = xnoData?.current_price || 0
	const currentXnoPrice = currentXnoPriceUSD * rate

	const otherCryptos = data.filter((c) => c.id !== CRYPTO_IDS.NANO).sort((a, b) => b.market_cap - a.market_cap)

	return (
		<div className="rounded-md border bg-card">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4">
				<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
					{t('xnoPriceIf')}
				</p>
				<Select value={currency} onValueChange={(v) => setCurrency(v as FiatCurrency)}>
					<SelectTrigger className="h-7 w-36 font-mono text-xs cursor-pointer">
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
			<div className="relative mt-3 max-h-150 overflow-auto rounded-b-md">
				<table className="w-full">
					<thead className="sticky top-0 z-10 border-b border-border bg-card">
						<tr className="text-foreground text-sm whitespace-nowrap">
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-left">
								{t('rank')}
							</th>
							<th className="px-3 py-2 pl-0 sm:pl-4 font-mono text-[10px] uppercase tracking-widest text-left">
								{t('name')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('marketCap')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('xnoPrice')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('multiplier')}
							</th>
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
	)
}
