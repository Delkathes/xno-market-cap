'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { FIAT_CURRENCY_CONFIG, type FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatFiatPrice,
	formatLargeNumber,
	formatPercentage,
	formatXNOAmount,
	getFiatRate,
} from '@/lib/currency-helpers'
import type { XnoPriceChangePerCurrency } from '@/lib/types'
import { cn } from '@/lib/utils'

import { fetchMarketData } from '@/hooks/use-market-data'

import { Skeleton } from '@/components/ui/skeleton'

// Live inline price chip with a hover panel — rendered as a shimmer on the server
// (cached article pages stay cache-friendly), then filled in from the shared
// market-data query on the client.
export function ArticleTicker() {
	const primaryFiat = useAtomValue(primaryFiatAtom)
	const { data } = useQuery({
		queryKey: ['market-data'],
		queryFn: fetchMarketData,
		staleTime: 60000,
	})

	if (!data) {
		return <Skeleton className="h-8 w-46 rounded-md" />
	}

	const rates: ExchangeRates = {
		eurRate: data.eurRate,
		gbpRate: data.gbpRate,
		jpyRate: data.jpyRate,
		chfRate: data.chfRate,
		cadRate: data.cadRate,
		audRate: data.audRate,
	}
	const fiat = primaryFiat as FiatCurrency
	const code = fiat.toLowerCase() as keyof XnoPriceChangePerCurrency
	const rate = getFiatRate(fiat, rates)
	const symbol = FIAT_CURRENCY_CONFIG[fiat].symbol
	const price = data.xnoData.current_price * rate
	const change24h = data.xnoPriceChange24h[code]
	const changes = [
		{ label: '1H', value: data.xnoPriceChange1h[code] },
		{ label: '24H', value: change24h },
		{ label: '7D', value: data.xnoPriceChange7d[code] },
	]

	return (
		<div className="group h-8 w-46 relative inline-block">
			<div
				role="status"
				aria-label={`XNO price in ${fiat.toUpperCase()}`}
				className="flex justify-between cursor-default items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
			>
				<span aria-hidden="true" className="relative flex h-1.5 w-1.5">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
					<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
				</span>
				<span aria-hidden="true" className="font-bold text-[#209CE9]">
					Ӿ
				</span>
				<span className="font-medium tabular-nums">{formatFiatPrice(price, fiat)}</span>
				<span
					className={cn(
						'flex items-center gap-0.5 font-semibold tabular-nums',
						change24h >= 0 ? 'text-trendup' : 'text-trenddown',
					)}
				>
					<span aria-hidden="true" className="text-[10px] leading-none">
						{change24h >= 0 ? '▲' : '▼'}
					</span>
					{formatPercentage(Math.abs(change24h))}
				</span>
			</div>

			<div
				role="tooltip"
				className="invisible absolute top-full right-0 z-10 mt-2 w-64 rounded-md border border-border bg-card p-3 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
			>
				<div className="flex items-baseline justify-between">
					<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XNO</span>
					<span className="font-mono text-lg font-bold tabular-nums">{formatFiatPrice(price, fiat)}</span>
				</div>
				<div className="mt-3 grid grid-cols-3 gap-2">
					{changes.map((change) => (
						<div
							key={change.label}
							className="rounded-md border border-border bg-muted/30 px-2 py-1.5 text-center"
						>
							<p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
								{change.label}
							</p>
							<p
								className={cn(
									'mt-0.5 font-mono text-xs font-bold tabular-nums',
									change.value >= 0 ? 'text-trendup' : 'text-trenddown',
								)}
							>
								{formatPercentage(change.value)}
							</p>
						</div>
					))}
				</div>
				<dl className="mt-3 space-y-1.5 border-t border-dashed border-border pt-2.5 font-mono text-xs">
					<div className="flex justify-between">
						<dt className="text-muted-foreground">VOL 24H</dt>
						<dd className="tabular-nums">
							{symbol}
							{formatLargeNumber(data.xnoData.total_volume * rate)}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-muted-foreground">MKT CAP</dt>
						<dd className="tabular-nums">
							{symbol}
							{formatLargeNumber(data.xnoData.market_cap * rate)}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-muted-foreground">SUPPLY</dt>
						<dd className="tabular-nums">
							{formatXNOAmount(data.xnoData.circulating_supply ?? 0, {
								compact: true,
								showSymbol: true,
							})}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	)
}
