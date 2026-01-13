'use client'

import Image from 'next/image'
import { memo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'

import { CRYPTO_IDS } from '@/lib/constants'
import { formatLargeNumber, formatPercentage, formatPrice } from '@/lib/currency-helpers'
import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { MarketDataError } from '@/components/market-data-error'

interface CryptoRowProps {
	crypto: CryptoData
	isXNO: boolean
	valueInXNO: number
	marketCapInXNO: number
	volumeInXNO: number
	relativeChange1h: number
	relativeChange24h: number
	relativeChange7d: number
}

const CryptoRow = memo(function CryptoRow({
	crypto,
	isXNO,
	valueInXNO,
	marketCapInXNO,
	volumeInXNO,
	relativeChange1h,
	relativeChange24h,
	relativeChange7d,
}: CryptoRowProps) {
	const router = useRouter()

	return (
		<tr
			onClick={() => router.push(`/coin/${crypto.id}`)}
			className={cn(
				'border-b border-border hover:bg-muted/50 transition-colors cursor-pointer',
				isXNO && 'bg-primary/5',
			)}
		>
			<td className="p-4">
				<div className="flex items-center gap-2 text-sm sm:text-base">
					{!isXNO && <span className="font-medium">{crypto.market_cap_rank}</span>}
				</div>
			</td>
			<td className="p-4 pl-0 sm:pl-4">
				<Link href={`/coin/${crypto.id}`} className="contents">
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
				</Link>
			</td>
			<td className="p-4 text-right font-mono text-sm sm:text-base text-primary">
				{isXNO ? <span>1.00</span> : formatPrice(valueInXNO)}
			</td>
			<td className="p-4 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange1h} />}
			</td>
			<td className="p-4 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange24h} />}
			</td>
			<td className="p-4 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange7d} />}
			</td>
			<td className="p-4 text-right font-mono text-primary text-sm sm:text-base">
				{formatLargeNumber(volumeInXNO)}
			</td>
			<td className="p-4 text-right font-mono text-primary text-sm sm:text-base">
				{formatLargeNumber(marketCapInXNO)}
			</td>
		</tr>
	)
})

function Change({ change }: { change: number }) {
	return (
		<div
			className={cn(
				'flex items-center justify-end gap-1 font-medium',
				change >= 0 ? 'text-constructive' : 'text-destructive',
			)}
		>
			{change >= 0 ? (
				<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
			) : (
				<TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
			)}
			{formatPercentage(Math.abs(change))}
		</div>
	)
}

export function MarketCapTable() {
	const { data, error, xnoData } = useMarketData()

	const t = useTranslations('marketTable')

	if (error || !data || !xnoData) {
		return (
			<Card>
				<CardContent className="p-6">
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	const sortedData = [...data].sort((a, b) => {
		if (a.id === CRYPTO_IDS.NANO) return -1
		if (b.id === CRYPTO_IDS.NANO) return 1
		return 0
	})

	return (
		<Card>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-muted-foreground text-sm">
								<th className="text-left p-4 font-medium">{t('rank')}</th>
								<th className="text-left p-4 pl-0 sm:pl-4 font-medium">{t('name')}</th>
								<th className="text-right p-4 font-medium">{t('priceXno')}</th>
								<th className="text-right p-4 font-medium">{t('change1h')}</th>
								<th className="text-right p-4 font-medium">{t('change24h')}</th>
								<th className="text-right p-4 font-medium">{t('change7d')}</th>
								<th className="text-right p-4 font-medium">{t('volume24h')}</th>
								<th className="text-right p-4 font-medium">{t('marketCapXno')}</th>
							</tr>
						</thead>
						<tbody>
							{sortedData?.map((crypto) => {
								const isXNO = crypto.id === CRYPTO_IDS.NANO

								const valueInXNO = crypto.current_price / xnoData.current_price
								const marketCapInXNO = isXNO
									? (xnoData.circulating_supply ?? 0)
									: crypto.market_cap / xnoData.current_price
								const volumeInXNO = crypto.total_volume / xnoData.current_price

								// Calculate relative changes vs XNO
								const xno1hChange = xnoData.price_change_percentage_1h_in_currency ?? 0
								const xno24hChange = xnoData.price_change_percentage_24h ?? 0
								const xno7dChange = xnoData.price_change_percentage_7d_in_currency ?? 0

								const relativeChange1h =
									(crypto.price_change_percentage_1h_in_currency ?? 0) - xno1hChange
								const relativeChange24h = (crypto.price_change_percentage_24h ?? 0) - xno24hChange
								const relativeChange7d =
									(crypto.price_change_percentage_7d_in_currency ?? 0) - xno7dChange

								return (
									<CryptoRow
										key={crypto.id}
										crypto={crypto}
										isXNO={isXNO}
										valueInXNO={valueInXNO}
										marketCapInXNO={marketCapInXNO}
										volumeInXNO={volumeInXNO}
										relativeChange1h={relativeChange1h}
										relativeChange24h={relativeChange24h}
										relativeChange7d={relativeChange7d}
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
