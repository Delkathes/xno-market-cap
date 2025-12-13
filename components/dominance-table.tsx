'use client'

import Image from 'next/image'
import { memo } from 'react'

import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketDataError } from '@/components/market-data-error'

interface DominanceRowProps {
	crypto: CryptoData
	index: number
	isXNO: boolean
	marketCapXNO: number
	dominance: number
}

const DominanceRow = memo(function DominanceRow({ crypto, index, isXNO, marketCapXNO, dominance }: DominanceRowProps) {
	return (
		<tr className={cn('border-b border-border hover:bg-muted/50 transition-colors', isXNO && 'bg-primary/5')}>
			<td className="p-4">{!isXNO && <span className="font-medium text-sm sm:text-base">{index}</span>}</td>
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
						<p className="font-semibold text-sm sm:text-base">{crypto.name}</p>
						<p className="text-xs sm:text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
					</div>
				</div>
			</td>
			<td className="p-4 text-right text-sm sm:text-base font-mono text-primary">
				{marketCapXNO >= 1e9 ? `${(marketCapXNO / 1e9).toFixed(2)}B` : `${(marketCapXNO / 1e6).toFixed(2)}M`}
			</td>
			<td className="p-4 text-right text-sm sm:text-base font-mono font-semibold">
				{dominance.toFixed(isXNO ? 4 : 2)}%
			</td>
			<td className="p-4 text-sm sm:text-base">
				<div className="flex items-center gap-2">
					<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all"
							style={{ width: `${dominance}%` }}
						/>
					</div>
				</div>
			</td>
		</tr>
	)
})

export function DominanceTable() {
	const { data, isLoading, error } = useMarketData()

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-0">
					<CardTitle>Loading...</CardTitle>
				</CardHeader>
			</Card>
		)
	}

	if (error || !data) {
		return (
			<Card>
				<CardHeader className="pb-0">
					<CardTitle>Dominance Rankings</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	const xno = data.find((c) => c.id === 'nano')
	const xnoPrice = xno?.current_price || 1
	const totalMarketCapXNO = data.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

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
								<th className="text-left p-4 pl-0 sm:pl-4 font-medium">Cryptocurrency</th>
								<th className="text-right p-4 font-medium">Market Cap (XNO)</th>
								<th className="text-right p-4 font-medium">Dominance</th>
								<th className="text-right p-4 font-medium w-50">Share</th>
							</tr>
						</thead>
						<tbody>
							{sortedData?.map((crypto, index) => {
								const marketCapXNO = crypto.market_cap / xnoPrice
								const dominance = (marketCapXNO / totalMarketCapXNO) * 100
								const isXNO = crypto.id === 'nano'

								return (
									<DominanceRow
										key={crypto.id}
										crypto={crypto}
										index={index}
										isXNO={isXNO}
										marketCapXNO={marketCapXNO}
										dominance={dominance}
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
