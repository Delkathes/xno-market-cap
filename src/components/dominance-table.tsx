'use client'

import Image from 'next/image'
import { memo } from 'react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
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
			<td className="px-3 py-2">{!isXNO && <span className="font-medium text-sm sm:text-base">{index}</span>}</td>
			<td className="px-3 py-2 pl-0 sm:pl-4">
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
			<td className="px-3 py-2 text-right text-sm font-mono text-xno-value font-medium">
				{marketCapXNO >= 1e9 ? `${(marketCapXNO / 1e9).toFixed(2)}B` : `${(marketCapXNO / 1e6).toFixed(2)}M`}
			</td>
			<td className="px-3 py-2 text-right text-sm font-mono font-semibold">
				{dominance.toFixed(isXNO ? 4 : 2)}%
			</td>
			<td className="px-3 py-2 text-sm sm:text-base">
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
	const t = useTranslations('dominance')

	const { data, error, xnoData } = useMarketData()

	if (error || !data) {
		return (
			<Card>
				<CardHeader className="pb-0">
					<CardTitle>{t('tableTitle')}</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	const xnoPrice = xnoData?.current_price || 1
	const totalMarketCapXNO = data.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)

	const sortedData = [...data].sort((a, b) => {
		if (a.id === CRYPTO_IDS.NANO) return -1
		if (b.id === CRYPTO_IDS.NANO) return 1
		return 0
	})

	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="border-b border-border">
					<tr className="text-foreground text-sm">
						<th className="text-left px-3 py-2 font-medium">#</th>
						<th className="text-left px-3 py-2 pl-0 sm:pl-4 font-medium">{t('cryptocurrency')}</th>
						<th className="text-right px-3 py-2 font-medium">{t('marketCapXno')}</th>
						<th className="text-right px-3 py-2 font-medium">{t('dominanceLabel')}</th>
						<th className="text-right px-3 py-2 font-medium w-50">{t('share')}</th>
					</tr>
				</thead>
				<tbody>
					{sortedData?.map((crypto, index) => {
						const isXNO = crypto.id === CRYPTO_IDS.NANO

						const marketCapXNO = isXNO ? (crypto.circulating_supply ?? 0) : crypto.market_cap / xnoPrice
						const dominance = (marketCapXNO / totalMarketCapXNO) * 100

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
	)
}
