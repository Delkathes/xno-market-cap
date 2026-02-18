'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import { formatLargeNumber } from '@/lib/currency-helpers'

import { useMarketData } from '@/hooks/use-market-data'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CoinInfoCardProps {
	coinId: string
}

function StatItem({
	label,
	value,
	suffix,
	isLoading,
}: {
	label: string
	value: string | number
	suffix?: string
	isLoading?: boolean
}) {
	return (
		<div className="flex flex-col">
			<span className="text-xs text-muted-foreground">{label}</span>
			{isLoading ? (
				<Skeleton className="h-5 w-20 mt-1" />
			) : (
				<span className="text-sm font-medium">
					{value}
					{suffix && <span className="text-muted-foreground ml-1">{suffix}</span>}
				</span>
			)}
		</div>
	)
}

export function CoinInfoCard({ coinId }: CoinInfoCardProps) {
	const t = useTranslations('coinDetail')
	const { data, xnoData, error } = useMarketData()

	// Find the coin in market data
	const coin = data?.find((c) => c.id === coinId)

	if (error || !coin) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>{t('errorLoading')}</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const isXNO = coinId === CRYPTO_IDS.NANO
	const marketCapInXNO = isXNO ? (xnoData.circulating_supply ?? 0) : coin.market_cap / xnoData.current_price
	const volumeInXNO = coin.total_volume / xnoData.current_price

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<Image
							src={coin.image || '/placeholder.svg'}
							alt={coin.name}
							width={48}
							height={48}
							className="rounded-full"
						/>
						<div>
							<div className="flex items-center gap-2">
								<CardTitle className="text-xl">{coin.name}</CardTitle>
								<Badge variant="secondary" className="uppercase">
									{coin.symbol}
								</Badge>
							</div>
							{coin.market_cap_rank && !isXNO && (
								<p className="text-sm text-muted-foreground">
									{t('rank', { rank: coin.market_cap_rank })}
								</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 gap-x-14 sm:gap-8 w-fit">
						<StatItem
							label={t('marketCap')}
							value={formatLargeNumber(marketCapInXNO, { includeK: true })}
							suffix="XNO"
						/>
						<StatItem
							label={t('volume24h')}
							value={formatLargeNumber(volumeInXNO, { includeK: true })}
							suffix="XNO"
						/>
						<StatItem
							label={t('circulatingSupply')}
							value={formatLargeNumber(coin.circulating_supply ?? 0, { includeK: true })}
							suffix={coin.symbol.toUpperCase()}
						/>
						<StatItem
							label={t('maxSupply')}
							value={coin.max_supply ? formatLargeNumber(coin.max_supply, { includeK: true }) : '∞'}
							suffix={coin.max_supply ? coin.symbol.toUpperCase() : undefined}
						/>
					</div>
				</div>
			</CardHeader>
		</Card>
	)
}
