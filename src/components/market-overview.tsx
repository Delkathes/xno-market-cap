'use client'

import { useState } from 'react'
import { useAtom } from 'jotai'
import { useTranslations } from 'next-intl'

import { CRYPTO_IDS, FiatCurrency } from '@/lib/constants'
import { cryptoCurrencyAtom, primaryFiatAtom, secondaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatCryptoMarketCap,
	formatCryptoPrice,
	formatFiatMarketCap,
	formatFiatPrice,
	formatPercentage,
	getFiatRate,
	getPriceChange,
	type PriceChange24h,
} from '@/lib/currency-helpers'
import type { CryptoData } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Card, CardContent } from '@/components/ui/card'
import { CurrencySettingsPopover } from '@/components/currency-settings-popover'
import { MarketDataError } from '@/components/market-data-error'

export function MarketOverview() {
	const {
		data,
		xnoCirculatingSupply,
		xnoData,
		eurRate,
		gbpRate,
		jpyRate,
		chfRate,
		cadRate,
		audRate,
		xnoPriceChange1h,
		xnoPriceChange24h,
		xnoPriceChange7d,
		error,
	} = useMarketData()

	const t = useTranslations('home')

	const [showSatoshi, setShowSatoshi] = useState(true)
	const [domChangeTimeframe, setDomChangeTimeframe] = useState<'1h' | '24h' | '7d'>('7d')

	const [primaryFiat] = useAtom(primaryFiatAtom)
	const [secondaryFiat] = useAtom(secondaryFiatAtom)
	const [cryptoCurrency] = useAtom(cryptoCurrencyAtom)

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }

	if (error || !data) {
		return <MarketDataError error={error} />
	}

	const btc = data.find((c) => c.id === CRYPTO_IDS.BITCOIN)
	const selectedCrypto = data.find((c) => c.id === cryptoCurrency) || btc

	const primaryRate = getFiatRate(primaryFiat, rates)
	const secondaryRate = getFiatRate(secondaryFiat, rates)

	const xnoMarketCapUSD = xnoData ? xnoCirculatingSupply * xnoData.current_price : 0
	const xnoMarketCapPrimary = xnoMarketCapUSD * primaryRate
	const xnoMarketCapSecondary = xnoMarketCapUSD * secondaryRate
	const xnoMarketCapCrypto = selectedCrypto ? xnoMarketCapUSD / selectedCrypto.current_price : 0

	const xnoPriceChange1hUSD = xnoPriceChange1h?.usd ?? 0
	const xnoPriceChange7dUSD = xnoPriceChange7d?.usd ?? 0
	const xnoPriceChangeUSD = xnoPriceChange24h?.usd ?? xnoData?.price_change_percentage_24h ?? 0

	// Per-currency-pair variations for the 1h / 24h / 7d columns
	const getFiatChanges = (fiat: FiatCurrency) => ({
		'1h': getPriceChange(fiat, xnoPriceChange1h as PriceChange24h | undefined),
		'24h': getPriceChange(fiat, xnoPriceChange24h as PriceChange24h | undefined),
		'7d': getPriceChange(fiat, xnoPriceChange7d as PriceChange24h | undefined),
	})
	const changesPrimary = getFiatChanges(primaryFiat)
	const changesSecondary = getFiatChanges(secondaryFiat)
	const changesCrypto = {
		'1h':
			xnoData && selectedCrypto
				? xnoPriceChange1hUSD - (selectedCrypto.price_change_percentage_1h_in_currency || 0)
				: 0,
		'24h': xnoData && selectedCrypto ? xnoPriceChangeUSD - (selectedCrypto.price_change_percentage_24h || 0) : 0,
		'7d':
			xnoData && selectedCrypto
				? xnoPriceChange7dUSD - (selectedCrypto.price_change_percentage_7d_in_currency || 0)
				: 0,
	}

	const xnoPrice = xnoData?.current_price || 1
	const totalMarketCapInXNO = data?.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0) || 0
	const xnoDominance = (xnoCirculatingSupply / totalMarketCapInXNO) * 100
	const btcDominance = btc ? (btc.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	const eth = data.find((c) => c.id === CRYPTO_IDS.ETHEREUM)
	const ethDominance = eth ? (eth.market_cap / xnoPrice / totalMarketCapInXNO) * 100 : 0

	// Others = everything except XNO, BTC, ETH
	const othersCoins = data.filter(
		(c) => c.id !== CRYPTO_IDS.NANO && c.id !== CRYPTO_IDS.BITCOIN && c.id !== CRYPTO_IDS.ETHEREUM,
	)
	const othersMarketCapXNO = othersCoins.reduce((sum, crypto) => sum + crypto.market_cap / xnoPrice, 0)
	const othersDominance = (othersMarketCapXNO / totalMarketCapInXNO) * 100

	// Dominance change (approximation): group weighted price change minus
	// market weighted average, per timeframe. Requires constant supply and
	// covers only the fetched top-100 set.
	const weightedChange = (coins: CryptoData[], getChange: (c: CryptoData) => number | null | undefined): number => {
		let weighted = 0
		let weight = 0
		for (const coin of coins) {
			const change = getChange(coin)
			if (change === null || change === undefined) continue
			weighted += coin.market_cap * change
			weight += coin.market_cap
		}
		return weight > 0 ? weighted / weight : 0
	}

	const groupAvgChange = (coins: CryptoData[]) => ({
		'1h': weightedChange(coins, (c) => c.price_change_percentage_1h_in_currency),
		'24h': weightedChange(coins, (c) => c.price_change_percentage_24h),
		'7d': weightedChange(coins, (c) => c.price_change_percentage_7d_in_currency),
	})

	const marketAvgChange = groupAvgChange(data)

	const deltaDominance = (group: { '1h': number; '24h': number; '7d': number }) => ({
		'1h': group['1h'] - marketAvgChange['1h'],
		'24h': group['24h'] - marketAvgChange['24h'],
		'7d': group['7d'] - marketAvgChange['7d'],
	})

	const xnoDominanceChanges = deltaDominance({
		'1h': xnoPriceChange1hUSD,
		'24h': xnoPriceChangeUSD,
		'7d': xnoPriceChange7dUSD,
	})
	const btcDominanceChanges = deltaDominance(groupAvgChange(btc ? [btc] : []))
	const ethDominanceChanges = deltaDominance(groupAvgChange(eth ? [eth] : []))
	const othersDominanceChanges = deltaDominance(groupAvgChange(othersCoins))

	const xnoPricePrimary = xnoData ? xnoData.current_price * primaryRate : 0
	const xnoPriceSecondary = xnoData ? xnoData.current_price * secondaryRate : 0
	const xnoPriceCrypto = xnoData && selectedCrypto ? xnoData.current_price / selectedCrypto.current_price : 0

	// Cycle the displayed dominance timeframe: 7D -> 1H -> 24H -> 7D ...
	const cycleDomChangeTimeframe = () => {
		setDomChangeTimeframe((prev) => (prev === '7d' ? '1h' : prev === '1h' ? '24h' : '7d'))
	}

	return (
		<div className="space-y-4">
			{/* ============ PRICE + MARKET CAP + DOMINANCE ============ */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
				{/* Price hero */}
				<Card className="group relative rounded-md lg:col-span-4">
					<CurrencySettingsPopover cryptoList={data} />
					<CardContent className="p-4 sm:p-5">
						<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{t('xnoPrice')}
						</p>

						{xnoData && selectedCrypto && (
							<>
								{/* Three equal price cells, each with its 1h / 24h / 7d column */}
								<div className="mt-3 grid grid-cols-3 gap-2">
									<PriceCell
										code={primaryFiat}
										value={formatFiatPrice(xnoPricePrimary, primaryFiat)}
										changes={changesPrimary}
									/>
									<PriceCell
										code={secondaryFiat}
										value={formatFiatPrice(xnoPriceSecondary, secondaryFiat)}
										changes={changesSecondary}
									/>
									<PriceCell
										code={selectedCrypto.symbol.toUpperCase()}
										value={formatCryptoPrice(xnoPriceCrypto, {
											symbol: selectedCrypto.symbol,
											asSatoshi: selectedCrypto.id === CRYPTO_IDS.BITCOIN && showSatoshi,
										})}
										changes={changesCrypto}
										onClick={() => setShowSatoshi(!showSatoshi)}
										title={t('clickToToggle', {
											options:
												selectedCrypto.id === CRYPTO_IDS.BITCOIN
													? t('betweenBtcAndSatoshi')
													: t('units'),
										})}
									/>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Market cap panel */}
				<Card className="group relative rounded-md lg:col-span-2">
					<CurrencySettingsPopover cryptoList={data} />
					<CardContent className="p-4 sm:p-5">
						<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{t('xnoMarketCap')}
						</p>
						<p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight">
							<span className="text-[#209CE9]">Ӿ</span> {(xnoCirculatingSupply / 1e6).toFixed(2)}M
						</p>

						<dl className="mt-4 space-y-1.5 border-t border-border pt-3 font-mono text-sm">
							{primaryFiat !== FiatCurrency.USD && (
								<div className="flex items-baseline justify-between">
									<dt className="text-muted-foreground">USD</dt>
									<dd suppressHydrationWarning className="tabular-nums">
										{formatFiatMarketCap(xnoMarketCapUSD, FiatCurrency.USD)}
									</dd>
								</div>
							)}
							<div className="flex items-baseline justify-between">
								<dt className="text-muted-foreground">{primaryFiat}</dt>
								<dd suppressHydrationWarning className="tabular-nums">
									{formatFiatMarketCap(xnoMarketCapPrimary, primaryFiat)}
								</dd>
							</div>
							{secondaryFiat !== primaryFiat && (
								<div className="flex items-baseline justify-between">
									<dt className="text-muted-foreground">{secondaryFiat}</dt>
									<dd suppressHydrationWarning className="tabular-nums">
										{formatFiatMarketCap(xnoMarketCapSecondary, secondaryFiat)}
									</dd>
								</div>
							)}
							<div className="flex items-baseline justify-between">
								<dt className="text-muted-foreground">
									{selectedCrypto ? selectedCrypto.symbol.toUpperCase() : '—'}
								</dt>
								<dd suppressHydrationWarning className="tabular-nums">
									{!selectedCrypto
										? '—'
										: formatCryptoMarketCap(xnoMarketCapCrypto, {
												symbol: selectedCrypto.symbol,
												asSatoshi: selectedCrypto.id === CRYPTO_IDS.BITCOIN && showSatoshi,
											})}
								</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				{/* Dominance panel */}
				<Card className="rounded-md lg:col-span-2">
					<CardContent className="p-4 sm:p-5">
						<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{t('xnoDominance')}
						</p>
						<div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
							<DomRow
								label="XNO"
								value={xnoDominance}
								isXNO
								changes={xnoDominanceChanges}
								activeChange={domChangeTimeframe}
								onCycle={cycleDomChangeTimeframe}
								cycleTitle={t('clickToSwitchTimeframe')}
							/>
							<DomRow
								label={t('btcDominance')}
								value={btcDominance}
								changes={btcDominanceChanges}
								activeChange={domChangeTimeframe}
								onCycle={cycleDomChangeTimeframe}
								cycleTitle={t('clickToSwitchTimeframe')}
							/>
							<DomRow
								label={t('ethDominance')}
								value={ethDominance}
								changes={ethDominanceChanges}
								activeChange={domChangeTimeframe}
								onCycle={cycleDomChangeTimeframe}
								cycleTitle={t('clickToSwitchTimeframe')}
							/>
							<DomRow
								label={t('othersDominance')}
								value={othersDominance}
								changes={othersDominanceChanges}
								activeChange={domChangeTimeframe}
								onCycle={cycleDomChangeTimeframe}
								cycleTitle={t('clickToSwitchTimeframe')}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

interface PriceCellChanges {
	'1h': number
	'24h': number
	'7d': number
}

function PriceCell({
	code,
	value,
	changes,
	onClick,
	title,
}: {
	code: string
	value: string
	changes: PriceCellChanges
	onClick?: () => void
	title?: string
}) {
	const content = (
		<>
			<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{code}</p>
			<p
				suppressHydrationWarning
				className="mt-1 truncate font-mono text-xl font-bold tabular-nums tracking-tight leading-none sm:text-2xl"
			>
				{value}
			</p>
			<div className="mt-2 space-y-1 border-t border-dashed border-border pt-1.5">
				<ChangeRow label="1H" value={changes['1h']} />
				<ChangeRow label="24H" value={changes['24h']} />
				<ChangeRow label="7D" value={changes['7d']} />
			</div>
		</>
	)

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				title={title}
				className="cursor-pointer rounded-md border border-border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:border-primary/50"
			>
				{content}
			</button>
		)
	}

	return <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">{content}</div>
}

function ChangeRow({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex items-center justify-between gap-1 font-mono text-[10px] tabular-nums">
			<span className="text-muted-foreground/70">{label}</span>
			<span
				suppressHydrationWarning
				className={cn('flex items-center gap-1 font-semibold', value >= 0 ? 'text-trendup' : 'text-trenddown')}
			>
				<span aria-hidden="true" className="text-[7px] leading-none">
					{value >= 0 ? '▲' : '▼'}
				</span>
				{formatPercentage(value)}
			</span>
		</div>
	)
}

function DomRow({
	label,
	value,
	isXNO,
	changes,
	activeChange,
	onCycle,
	cycleTitle,
}: {
	label: string
	value: number
	isXNO?: boolean
	changes?: PriceCellChanges
	activeChange?: '1h' | '24h' | '7d'
	onCycle?: () => void
	cycleTitle?: string
}) {
	return (
		<div>
			<div className="flex items-baseline justify-between font-mono text-sm">
				<span
					className={cn(
						'text-xs uppercase tracking-widest',
						isXNO ? 'font-semibold text-[#209CE9]' : 'text-muted-foreground',
					)}
				>
					{label}
				</span>
				<span
					suppressHydrationWarning
					className={cn('font-bold tabular-nums', isXNO ? 'text-[#209CE9]' : 'text-foreground')}
				>
					{value.toFixed(isXNO ? 4 : 2)}%
				</span>
			</div>
			<div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-muted">
				<div
					className={cn('h-full rounded-sm', isXNO ? 'bg-[#209CE9]' : 'bg-muted-foreground/40')}
					style={{ width: `${Math.min(value, 100)}%` }}
				/>
			</div>
			{changes && activeChange && onCycle && (
				<div className="group mt-2 border-t border-dashed border-border pt-1.5">
					<button
						type="button"
						onClick={onCycle}
						title={cycleTitle}
						className="flex w-full cursor-pointer items-center justify-between gap-1 font-mono text-[10px] tabular-nums transition-colors hover:text-primary"
					>
						<span className="flex items-center gap-1 text-muted-foreground/70">
							{activeChange.toUpperCase()}
							<span
								aria-hidden="true"
								className="text-[9px] text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
							>
								↻
							</span>
						</span>
						<span
							className={cn(
								'flex items-center gap-1 font-semibold',
								changes[activeChange] >= 0 ? 'text-trendup' : 'text-trenddown',
							)}
						>
							<span aria-hidden="true" className="text-[7px] leading-none">
								{changes[activeChange] >= 0 ? '▲' : '▼'}
							</span>
							{formatPercentage(changes[activeChange])}
						</span>
					</button>
				</div>
			)}
		</div>
	)
}
