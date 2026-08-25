'use client'

import Image from 'next/image'
import { memo } from 'react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

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
		<tr
			className={cn(
				'border-b border-l-2 border-border border-l-transparent transition-colors hover:bg-muted/40',
				isXNO && 'border-l-[#209CE9] bg-[#209CE9]/[0.05]',
			)}
		>
			<td className="px-3 py-1.5">
				<div className="flex w-6 items-center justify-center text-sm sm:text-base">
					{isXNO ? (
						<span className="font-mono text-[#209CE9]">Ӿ</span>
					) : (
						<span className="font-medium tabular-nums">{index}</span>
					)}
				</div>
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
						<p className="font-semibold text-sm sm:text-base line-clamp-1">{crypto.name}</p>
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							{crypto.symbol}
						</p>
					</div>
				</div>
			</td>
			<td className="px-3 py-1.5 text-right font-mono text-sm font-medium tabular-nums text-xno-value">
				{marketCapXNO >= 1e9 ? `${(marketCapXNO / 1e9).toFixed(2)}B` : `${(marketCapXNO / 1e6).toFixed(2)}M`}
			</td>
			<td
				className={cn(
					'px-3 py-1.5 text-right font-mono text-sm font-semibold tabular-nums',
					isXNO && 'text-[#209CE9]',
				)}
			>
				{dominance.toFixed(isXNO ? 4 : 2)}%
			</td>
			<td className="px-3 py-1.5 text-sm sm:text-base">
				<div className="flex items-center gap-2">
					<div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-muted">
						<div
							className={cn('h-full rounded-sm transition-all', isXNO ? 'bg-[#209CE9]' : 'bg-primary')}
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
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<MarketDataError error={error} compact />
			</div>
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
		<div className="rounded-md border bg-card">
			<div className="flex items-center justify-between gap-3 px-4 pt-4">
				<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
					{t('tableTitle')}
				</p>
			</div>
			<div className="relative mt-3 max-h-150 overflow-auto rounded-b-md">
				<table className="w-full">
					<thead className="sticky top-0 z-10 border-b border-border bg-card">
						<tr className="text-foreground text-sm">
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-left">#</th>
							<th className="px-3 py-2 pl-0 sm:pl-4 font-mono text-[10px] uppercase tracking-widest text-left">
								{t('cryptocurrency')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('marketCapXno')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('dominanceLabel')}
							</th>
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right w-50">
								{t('share')}
							</th>
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
		</div>
	)
}
