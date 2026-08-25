'use client'

import Image from 'next/image'
import { useState } from 'react'
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
	index: number
	isXNO: boolean
	valueInXNO: number
	marketCapInXNO: number
	volumeInXNO: number
	relativeChange1h: number
	relativeChange24h: number
	relativeChange7d: number
}

function CryptoRow({
	crypto,
	index,
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
				'border-b border-l-2 border-border border-l-transparent transition-colors cursor-pointer hover:bg-muted/40',
				isXNO && 'border-l-[#209CE9] bg-[#209CE9]/[0.05]',
			)}
		>
			<td className="px-3 py-1.5">
				<div className="flex w-6 items-center justify-center text-sm sm:text-base">
					{isXNO ? (
						<span className="font-mono text-[#209CE9]">Ӿ</span>
					) : (
						<span className="font-medium tabular-nums">{crypto.market_cap_rank}</span>
					)}
				</div>
			</td>
			<td className="px-3 py-1.5 pl-0 sm:pl-4">
				<Link href={`/coin/${crypto.id}`} className="contents">
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
							<p className="font-semibold text-sm sm:text-base">{crypto.name}</p>
							<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
								{crypto.symbol}
							</p>
						</div>
					</div>
				</Link>
			</td>
			<td className="px-3 py-1.5 text-right font-mono text-sm font-medium tabular-nums text-xno-value">
				{isXNO ? <span>1.00</span> : formatPrice(valueInXNO)}
			</td>
			<td className="px-3 py-1.5 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange1h} />}
			</td>
			<td className="px-3 py-1.5 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange24h} />}
			</td>
			<td className="px-3 py-1.5 text-right text-xs sm:text-sm">
				{isXNO ? <span className="text-muted-foreground">-</span> : <Change change={relativeChange7d} />}
			</td>
			<td className="px-3 py-1.5 text-right font-mono font-medium tabular-nums text-xno-value text-sm">
				{formatLargeNumber(volumeInXNO)}
			</td>
			<td className="px-3 py-1.5 text-right font-mono font-medium tabular-nums text-xno-value text-sm">
				{formatLargeNumber(marketCapInXNO)}
			</td>
		</tr>
	)
}

function Change({ change }: { change: number }) {
	return (
		<div
			className={cn(
				'flex items-center justify-end gap-1 font-medium',
				change >= 0 ? 'text-trendup' : 'text-trenddown',
			)}
		>
			<span aria-hidden="true" className="text-[11px] leading-none">
				{change >= 0 ? '▲' : '▼'}
			</span>
			{formatPercentage(Math.abs(change))}
		</div>
	)
}

type SortColumn = 'price' | 'change1h' | 'change24h' | 'change7d' | 'volume' | 'marketCap'
type SortDirection = 'asc' | 'desc'

interface SortableHeaderProps {
	column: SortColumn
	currentSort: SortColumn
	currentDirection: SortDirection
	onSort: (column: SortColumn) => void
	children: React.ReactNode
	align?: 'left' | 'right'
}

function SortableHeader({
	column,
	currentSort,
	currentDirection,
	onSort,
	children,
	align = 'right',
}: SortableHeaderProps) {
	const isActive = currentSort === column

	return (
		<th
			className={cn(
				'px-3 py-2 font-mono text-[10px] uppercase tracking-widest cursor-pointer select-none hover:bg-muted/50 transition-colors',
				align === 'right' ? 'text-right' : 'text-left',
			)}
			onClick={() => onSort(column)}
		>
			<div className={cn('flex items-center gap-1', align === 'right' ? 'justify-end' : 'justify-start')}>
				<span>{children}</span>
				<div className="flex flex-col -space-y-1.5" aria-hidden="true">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						role="img"
						aria-hidden="true"
						className={cn(
							'transition-colors',
							isActive && currentDirection === 'asc' ? 'text-foreground' : 'text-muted-foreground/40',
						)}
					>
						<path d="M18.0566 16H5.94336C5.10459 16 4.68455 14.9782 5.27763 14.3806L11.3343 8.27783C11.7019 7.90739 12.2981 7.90739 12.6657 8.27783L18.7223 14.3806C19.3155 14.9782 18.8954 16 18.0566 16Z" />
					</svg>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						role="img"
						aria-hidden="true"
						className={cn(
							'transition-colors',
							isActive && currentDirection === 'desc' ? 'text-foreground' : 'text-muted-foreground/40',
						)}
					>
						<path d="M18.0566 8H5.94336C5.10459 8 4.68455 9.02183 5.27763 9.61943L11.3343 15.7222C11.7019 16.0926 12.2981 16.0926 12.6657 15.7222L18.7223 9.61943C19.3155 9.02183 18.8954 8 18.0566 8Z" />
					</svg>
				</div>
			</div>
		</th>
	)
}

export function MarketCapTable() {
	const { data, error, xnoData } = useMarketData()
	const [sortColumn, setSortColumn] = useState<SortColumn>('marketCap')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

	const t = useTranslations('marketTable')

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
		} else {
			setSortColumn(column)
			setSortDirection('desc')
		}
	}

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
		// Always keep XNO at the top
		if (a.id === CRYPTO_IDS.NANO) return -1
		if (b.id === CRYPTO_IDS.NANO) return 1

		const xnoPrice = xnoData.current_price
		const xno1hChange = xnoData.price_change_percentage_1h_in_currency ?? 0
		const xno24hChange = xnoData.price_change_percentage_24h ?? 0
		const xno7dChange = xnoData.price_change_percentage_7d_in_currency ?? 0

		const getValue = (crypto: CryptoData): number => {
			switch (sortColumn) {
				case 'price':
					return crypto.current_price / xnoPrice
				case 'change1h':
					return (crypto.price_change_percentage_1h_in_currency ?? 0) - xno1hChange
				case 'change24h':
					return (crypto.price_change_percentage_24h ?? 0) - xno24hChange
				case 'change7d':
					return (crypto.price_change_percentage_7d_in_currency ?? 0) - xno7dChange
				case 'volume':
					return crypto.total_volume / xnoPrice
				case 'marketCap':
					return crypto.market_cap / xnoPrice
			}
		}

		const aValue = getValue(a)
		const bValue = getValue(b)

		return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
	})

	return (
		<div className="relative max-h-150 overflow-auto rounded-md border border-border bg-card">
			<table className="w-full">
				<thead className="sticky top-0 z-10 border-b border-border bg-card">
					<tr className="text-foreground text-sm">
						<th className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
							{t('rank')}
						</th>
						<th className="text-left px-3 py-2 pl-0 sm:pl-4 font-mono text-[10px] uppercase tracking-widest">
							{t('name')}
						</th>
						<SortableHeader
							column="price"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('priceXno')}
						</SortableHeader>
						<SortableHeader
							column="change1h"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('change1h')}
						</SortableHeader>
						<SortableHeader
							column="change24h"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('change24h')}
						</SortableHeader>
						<SortableHeader
							column="change7d"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('change7d')}
						</SortableHeader>
						<SortableHeader
							column="volume"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('volume24h')}
						</SortableHeader>
						<SortableHeader
							column="marketCap"
							currentSort={sortColumn}
							currentDirection={sortDirection}
							onSort={handleSort}
						>
							{t('marketCapXno')}
						</SortableHeader>
					</tr>
				</thead>
				<tbody>
					{sortedData?.map((crypto, index) => {
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

						const relativeChange1h = (crypto.price_change_percentage_1h_in_currency ?? 0) - xno1hChange
						const relativeChange24h = (crypto.price_change_percentage_24h ?? 0) - xno24hChange
						const relativeChange7d = (crypto.price_change_percentage_7d_in_currency ?? 0) - xno7dChange

						return (
							<CryptoRow
								key={crypto.id}
								crypto={crypto}
								index={index}
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
	)
}
