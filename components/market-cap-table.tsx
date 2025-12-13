'use client'

import Image from 'next/image'
import { memo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketDataError } from '@/components/market-data-error'

import type { CryptoData } from '../lib/types'

interface CryptoRowProps {
	crypto: CryptoData
	isXNO: boolean
	valueInXNO: number
	marketCapInXNO: number
	relativeChange: number
}

const CryptoRow = memo(function CryptoRow({
	crypto,
	isXNO,
	valueInXNO,
	marketCapInXNO,
	relativeChange,
}: CryptoRowProps) {
	return (
		<tr className={cn('border-b border-border hover:bg-muted/50 transition-colors', isXNO && 'bg-primary/5')}>
			<td className="p-4">
				<div className="flex items-center gap-2">
					{!isXNO && <span className="font-medium">{crypto.market_cap_rank}</span>}
				</div>
			</td>
			<td className="p-4 pl-0 sm:pl-4">
				<div className="flex items-center gap-3">
					<Image
						src={crypto.image || '/placeholder.svg'}
						alt={crypto.name}
						width={32}
						height={32}
						className="rounded-full"
					/>
					<div>
						<p className="font-semibold">{crypto.name}</p>
						<p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
					</div>
				</div>
			</td>
			<td className="p-4 text-right font-mono text-primary">
				{isXNO ? (
					<span>1.00</span>
				) : (
					valueInXNO.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})
				)}
			</td>
			<td className="p-4 text-right">
				{isXNO ? (
					<span className="text-muted-foreground">-</span>
				) : (
					<div
						className={cn(
							'flex items-center justify-end gap-1 font-medium',
							relativeChange >= 0 ? 'text-constructive' : 'text-destructive',
						)}
					>
						{relativeChange >= 0 ? (
							<TrendingUp className="w-4 h-4" />
						) : (
							<TrendingDown className="w-4 h-4" />
						)}
						{Math.abs(relativeChange).toFixed(2)}%
					</div>
				)}
			</td>
			<td className="p-4 text-right font-mono text-primary">
				{marketCapInXNO >= 1e9
					? `${(marketCapInXNO / 1e9).toFixed(2)}B`
					: `${(marketCapInXNO / 1e6).toFixed(2)}M`}
			</td>
		</tr>
	)
})

export function MarketCapTable() {
	const { data, isLoading, error } = useMarketData()

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Loading market data...</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[...Array(10)].map((_, _i) => (
							<div key={`${_}-card-item`} className="h-16 animate-pulse bg-muted rounded" />
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

	const xno = data.find((c) => c.id === 'nano')

	const sortedData = [...data].sort((a, b) => {
		if (a.id === 'nano') return -1
		if (b.id === 'nano') return 1
		return 0
	})

	return (
		<Card>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-muted-foreground text-sm">
								<th className="text-left p-4 font-medium">#</th>
								<th className="text-left p-4 pl-0 sm:pl-4 font-medium">Name</th>
								<th className="text-right p-4 font-medium">Price (XNO)</th>
								<th className="text-right p-4 font-medium">24h %</th>
								<th className="text-right p-4 font-medium">Market Cap (XNO)</th>
							</tr>
						</thead>
						<tbody>
							{sortedData?.map((crypto) => {
								const isXNO = crypto.id === 'nano'
								const valueInXNO = xno ? crypto.current_price / xno.current_price : 0
								const marketCapInXNO = xno ? crypto.market_cap / xno.current_price : 0
								const xno24hChange = xno?.price_change_percentage_24h || 0
								const relativeChange = crypto.price_change_percentage_24h ?? 0 - xno24hChange

								return (
									<CryptoRow
										key={crypto.id}
										crypto={crypto}
										isXNO={isXNO}
										valueInXNO={valueInXNO}
										marketCapInXNO={marketCapInXNO}
										relativeChange={relativeChange}
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
