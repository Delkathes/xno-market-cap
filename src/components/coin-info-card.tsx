'use client'

import { useTranslations } from 'next-intl'

import { CRYPTO_IDS } from '@/lib/constants'
import { formatLargeNumber, formatPercentage } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { CoinIcon } from '@/components/coin-icon'

interface CoinInfoCardProps {
	coinId: string
}

function StatCell({
	label,
	value,
	sub,
	accent,
}: {
	label: string
	value: string
	sub?: React.ReactNode
	accent?: 'up' | 'down'
}) {
	return (
		<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
			<p
				suppressHydrationWarning
				className="mt-1 truncate font-mono text-lg font-bold tabular-nums tracking-tight leading-none"
			>
				{value}
			</p>
			{sub && (
				<p
					suppressHydrationWarning
					className={cn(
						'mt-1.5 flex items-center gap-1 font-mono text-[10px] font-semibold tabular-nums',
						accent === 'up' && 'text-trendup',
						accent === 'down' && 'text-trenddown',
						!accent && 'text-muted-foreground/70',
					)}
				>
					{sub}
				</p>
			)}
		</div>
	)
}

export function CoinInfoCard({ coinId }: CoinInfoCardProps) {
	const t = useTranslations('coinDetail')
	const { data, xnoData, error } = useMarketData()

	// Find the coin in market data
	const coin = data?.find((c) => c.id === coinId)

	if (error || !coin || !xnoData) {
		return (
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<p>{t('errorLoading')}</p>
			</div>
		)
	}

	const isXNO = coinId === CRYPTO_IDS.NANO
	const marketCapInXNO = isXNO ? (xnoData.circulating_supply ?? 0) : coin.market_cap / xnoData.current_price
	const volumeInXNO = coin.total_volume / xnoData.current_price

	// Fully diluted market cap in XNO + dilution multiple (max / circulating)
	const fdvInXNO =
		coin.max_supply !== null && coin.max_supply !== undefined
			? (coin.max_supply * coin.current_price) / xnoData.current_price
			: null
	const dilutionMultiple = fdvInXNO !== null && (coin.circulating_supply ?? 0) > 0 ? fdvInXNO / marketCapInXNO : null

	// Price in XNO + relative 24h change vs XNO
	const priceInXNO = coin.current_price / xnoData.current_price
	const coin24hChange = coin.price_change_percentage_24h ?? 0
	const xno24hChange = xnoData.price_change_percentage_24h ?? 0
	const relativeChange = xnoData ? coin24hChange - xno24hChange : 0

	const xnoSymbol = xnoData.symbol.toUpperCase()

	return (
		<Card className="rounded-md">
			<CardContent className="p-4 sm:p-5">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
					{/* Identity */}
					<div className="flex items-center gap-4">
						<CoinIcon
							id={coin.id}
							image={coin.image}
							alt={coin.name}
							width={48}
							height={48}
							className="rounded-full ring-1 ring-border"
						/>
						<div>
							<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<h1 className="text-xl font-bold tracking-tight">{coin.name}</h1>
								<span className="font-mono text-[11px] uppercase tracking-widest text-[#209CE9]">
									{coin.symbol}
								</span>
							</div>
							<p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
								{isXNO ? (
									`Ӿ ${xnoSymbol}`
								) : (
									<>
										{t('rank', { rank: coin.market_cap_rank })}
										<span className="text-muted-foreground/40"> {'//'} </span>
										{t('price')} vs Ӿ
									</>
								)}
							</p>
						</div>
					</div>

					{/* Stat strip */}
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
						<StatCell
							label={t('price')}
							value={`Ӿ ${formatLargeNumber(priceInXNO, { decimals: 4 })}`}
							sub={
								<>
									<span aria-hidden="true" className="text-[8px] leading-none">
										{relativeChange >= 0 ? '▲' : '▼'}
									</span>
									{formatPercentage(Math.abs(relativeChange))}
								</>
							}
							accent={relativeChange >= 0 ? 'up' : 'down'}
						/>
						<StatCell
							label={t('marketCap')}
							value={formatLargeNumber(marketCapInXNO, { includeK: true })}
							sub={xnoSymbol}
						/>
						<StatCell
							label={t('volume24h')}
							value={formatLargeNumber(volumeInXNO, { includeK: true })}
							sub={xnoSymbol}
						/>
						<StatCell
							label={t('circulatingSupply')}
							value={formatLargeNumber(coin.circulating_supply ?? 0, { includeK: true })}
							sub={coin.symbol.toUpperCase()}
						/>
						<StatCell
							label={t('maxSupply')}
							value={coin.max_supply ? formatLargeNumber(coin.max_supply, { includeK: true }) : '∞'}
							sub={coin.max_supply ? coin.symbol.toUpperCase() : undefined}
						/>
						<StatCell
							label={t('fdv')}
							value={fdvInXNO !== null ? `Ӿ ${formatLargeNumber(fdvInXNO, { includeK: true })}` : '∞'}
							sub={
								dilutionMultiple !== null
									? t('diluted', { ratio: dilutionMultiple.toFixed(2) })
									: undefined
							}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
