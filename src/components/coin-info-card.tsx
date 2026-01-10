'use client'

import Image from 'next/image'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import { cn } from '@/lib/utils'

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

function formatLargeNumber(value: number): string {
	if (value >= 1e12) {
		return `${(value / 1e12).toFixed(2)}T`
	}
	if (value >= 1e9) {
		return `${(value / 1e9).toFixed(2)}B`
	}
	if (value >= 1e6) {
		return `${(value / 1e6).toFixed(2)}M`
	}
	if (value >= 1e3) {
		return `${(value / 1e3).toFixed(2)}K`
	}
	return value.toFixed(2)
}

function formatPrice(value: number): string {
	if (value >= 1) {
		return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	}
	return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

export function CoinInfoCard({ coinId }: CoinInfoCardProps) {
	const t = useTranslations('coinDetail')
	const { data, xnoData, isLoading, error } = useMarketData()

	// Find the coin in market data
	const coin = data?.find((c) => c.id === coinId)

	if (error) {
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

	if (isLoading || !coin || !xnoData) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[...Array(8)].map((_, i) => {
							const key = `skeleton-${i}`
							return (
								<div key={key} className="space-y-1">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-5 w-24" />
								</div>
							)
						})}
					</div>
				</CardContent>
			</Card>
		)
	}

	const isXNO = coinId === CRYPTO_IDS.NANO
	const priceInXNO = isXNO ? 1 : coin.current_price / xnoData.current_price
	const marketCapInXNO = isXNO ? (xnoData.circulating_supply ?? 0) : coin.market_cap / xnoData.current_price
	const volumeInXNO = coin.total_volume / xnoData.current_price
	const xno24hChange = xnoData.price_change_percentage_24h ?? 0
	const relativeChange = isXNO ? 0 : (coin.price_change_percentage_24h ?? 0) - xno24hChange
	const isPositive = relativeChange >= 0

	return (
		<Card>
			<CardHeader className="pb-0">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
							{coin.market_cap_rank && (
								<p className="text-sm text-muted-foreground">
									{t('rank', { rank: coin.market_cap_rank })}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-col items-start sm:items-end">
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold text-primary">{formatPrice(priceInXNO)} XNO</span>
						</div>
						{!isXNO && (
							<div
								className={cn(
									'flex items-center gap-1 text-sm font-medium',
									isPositive ? 'text-constructive' : 'text-destructive',
								)}
							>
								{isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
								{isPositive ? '+' : ''}
								{relativeChange.toFixed(2)}% {t('vs24h')}
							</div>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-4">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<StatItem label={t('marketCap')} value={formatLargeNumber(marketCapInXNO)} suffix="XNO" />
					<StatItem label={t('volume24h')} value={formatLargeNumber(volumeInXNO)} suffix="XNO" />
					<StatItem
						label={t('circulatingSupply')}
						value={formatLargeNumber(coin.circulating_supply ?? 0)}
						suffix={coin.symbol.toUpperCase()}
					/>
					<StatItem
						label={t('maxSupply')}
						value={coin.max_supply ? formatLargeNumber(coin.max_supply) : '∞'}
						suffix={coin.max_supply ? coin.symbol.toUpperCase() : undefined}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
