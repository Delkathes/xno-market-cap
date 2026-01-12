'use client'

import { memo, useMemo } from 'react'
import { useAtom } from 'jotai'
import { Infinity as InfinityIcon, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { type AssetData, type AssetId, FIAT_ASSETS } from '@/lib/asset-config'
import { FiatCurrency } from '@/lib/constants'
import { parityFiatCurrenciesAtom } from '@/lib/currency-atoms'
import { cn } from '@/lib/utils'

import { useAssetData } from '@/hooks/use-asset-data'
import { calculateAllParities, useFilteredAssets } from '@/hooks/use-filtered-assets'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { MarketDataError } from '@/components/market-data-error'

// =============================================================================
// PURE FUNCTIONS - Data Transformation
// =============================================================================

// Format supply for display
const formatSupply = (asset: AssetData): string => {
	const { currentSupply, symbol, type } = asset

	if (type === 'fiat') {
		const trillions = currentSupply / 1_000_000_000_000
		return `${symbol}${trillions.toFixed(1)}T`
	}

	if (type === 'commodity') {
		return `${(currentSupply / 1_000_000).toFixed(0)}M kg`
	}

	if (currentSupply >= 1_000_000) {
		return `${(currentSupply / 1_000_000).toFixed(1)}M`
	}

	return currentSupply.toLocaleString()
}

// Calculate supply percentage (current / max)
const getSupplyPercentage = (asset: AssetData): number | null => {
	if (asset.maxSupply === null) return null
	return (asset.currentSupply / asset.maxSupply) * 100
}

// Format max supply for display
const formatMaxSupply = (asset: AssetData): string => {
	const { maxSupply, symbol, type } = asset

	if (maxSupply === null) return '∞'

	if (type === 'fiat') {
		const trillions = maxSupply / 1_000_000_000_000
		return `${symbol}${trillions.toFixed(1)}T`
	}

	if (type === 'commodity') {
		return `${(maxSupply / 1_000_000).toFixed(0)}M kg`
	}

	if (maxSupply >= 1_000_000) {
		return `${(maxSupply / 1_000_000).toFixed(1)}M`
	}

	return maxSupply.toLocaleString()
}

// Format parity value for display
const formatParityValue = (value: number, asset: AssetData): string => {
	const { symbol, unit, id } = asset
	const isFiat = asset.type === 'fiat'

	if (isFiat) {
		// JPY has much larger numbers
		if (id === FiatCurrency.JPY) {
			if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(0)}B`
			if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(0)}M`
			if (value >= 1_000) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
			return `${symbol}${value.toFixed(0)}`
		}

		if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(0)}M`
		if (value >= 1_000) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
		if (value >= 1) return `${symbol}${value.toFixed(2)}`
		return `${symbol}${value.toFixed(8)}`
	}

	// Crypto and commodity
	if (value >= 1) {
		const decimals = value >= 100 ? 0 : value >= 10 ? 2 : 3
		return `${value.toFixed(decimals)} ${unit}`
	}

	return `${value.toFixed(4)} ${unit}`
}

// Generate dynamic note for crypto assets with live data
const getDynamicNote = (asset: AssetData): string => {
	if (asset.type !== 'crypto' || !asset.isLive) return asset.note

	const percentage = getSupplyPercentage(asset)
	if (percentage === null) return asset.note

	if (asset.id === 'XNO') {
		return 'Fixed, fully distributed'
	}

	if (asset.id === 'BTC' && asset.maxSupply) {
		const maxInM = asset.maxSupply / 1_000_000
		return `~${percentage.toFixed(0)}% mined of ${maxInM}M cap`
	}

	return asset.note
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Supply cell with progress bar
interface SupplyCellProps {
	asset: AssetData
}

function SupplyCell({ asset }: SupplyCellProps) {
	const percentage = getSupplyPercentage(asset)
	const isInfinite = asset.maxSupply === null
	const isFullyDistributed = percentage === 100

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between gap-2 text-xs">
				<span className="font-mono text-primary">
					{formatSupply(asset)}
					{asset.isLive && (
						<span className="ml-1 text-[10px] text-emerald-500" title="Live data">
							●
						</span>
					)}
				</span>
				{isInfinite ? (
					<span className="flex items-center gap-0.5 text-muted-foreground">
						<InfinityIcon className="h-3 w-3" />
					</span>
				) : (
					<span className="text-muted-foreground">/ {formatMaxSupply(asset)}</span>
				)}
			</div>
			<div className="relative">
				{isInfinite ? (
					// Infinite supply - animated gradient bar
					<div className="h-1.5 w-full rounded-full bg-linear-to-r from-destructive/30 via-destructive/60 to-destructive/30 overflow-hidden">
						<div
							className="h-full w-full bg-linear-to-r from-transparent via-destructive/80 to-transparent animate-pulse"
							style={{ animationDuration: '2s' }}
						/>
					</div>
				) : (
					// Fixed supply - show progress
					<Progress
						value={percentage ?? 0}
						className={cn(
							'h-1.5',
							isFullyDistributed
								? '*:data-[slot=progress-indicator]:bg-emerald-500'
								: '*:data-[slot=progress-indicator]:bg-primary',
						)}
					/>
				)}
			</div>
			<div className="text-[10px] text-muted-foreground text-right">
				{isInfinite ? (
					<span className="text-destructive/80">Unbounded supply</span>
				) : isFullyDistributed ? (
					<span className="text-emerald-600">100% distributed</span>
				) : (
					<span>{percentage?.toFixed(1)}% of max</span>
				)}
			</div>
		</div>
	)
}

// Loading skeleton for table
export function ParityTableSkeleton() {
	const t = useTranslations('parity')

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('nanoScarcityParity')}</CardTitle>
				<CardDescription>{t('tableDescription')}</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((index) => (
						<Skeleton key={`${index}-parity-table-skeleton-item`} className="h-16 w-full" />
					))}
				</div>
			</CardContent>
		</Card>
	)
}

// Settings popover for fiat currency selection
export function ParitySettingsPopover() {
	const t = useTranslations('parity')

	const [enabledFiats, setEnabledFiats] = useAtom(parityFiatCurrenciesAtom)
	const { assetMap } = useAssetData()

	const toggleFiat = (fiat: FiatCurrency) => {
		setEnabledFiats((current) => {
			if (current.includes(fiat)) {
				// Don't allow removing all fiats
				return current.length > 1 ? current.filter((f) => f !== fiat) : current
			}
			return [...current, fiat]
		})
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<Settings className="h-4 w-4" />
					<span className="sr-only">{t('fiatCurrencySettings')}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64" align="end">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">{t('fiatCurrencies')}</h4>
						<p className="text-sm text-muted-foreground">{t('selectCurrenciesToDisplay')}</p>
					</div>
					<div className="grid gap-2">
						{FIAT_ASSETS.map((fiat) => {
							const asset = assetMap[fiat]
							const isEnabled = enabledFiats.includes(fiat)
							return (
								<Button
									key={fiat}
									variant={isEnabled ? 'default' : 'outline'}
									size="sm"
									className="justify-start"
									onClick={() => toggleFiat(fiat)}
								>
									<span className="w-8">{asset.symbol}</span>
									{asset.label}
								</Button>
							)
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}

// Table row component
interface ParityRowProps {
	assetId: AssetId
	targetAssets: AssetId[]
	assetMap: Record<AssetId, AssetData>
}

const ParityRow = memo(function ParityRow({ assetId, targetAssets, assetMap }: ParityRowProps) {
	const asset = assetMap[assetId]
	const isXNO = assetId === 'XNO'

	const parities = useMemo(
		() => calculateAllParities(assetId, targetAssets, assetMap),
		[assetId, targetAssets, assetMap],
	)

	return (
		<tr className={cn('border-b border-border hover:bg-muted/50 transition-colors', isXNO && 'bg-primary/5')}>
			<td className="p-4">
				<div className="flex items-center gap-3">
					<div
						className={cn(
							'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold',
							asset.color.bg,
							asset.color.text,
						)}
					>
						{asset.symbol}
					</div>
					<div>
						<p className="font-semibold text-sm sm:text-base">{asset.label}</p>
						<p className="text-xs text-muted-foreground">1 {asset.unit}</p>
					</div>
				</div>
			</td>
			{targetAssets.map((targetId) => {
				const targetAsset = assetMap[targetId]
				const isSelf = assetId === targetId
				const value = parities[targetId]

				return (
					<td
						key={targetId}
						className={cn(
							'p-4 text-right font-mono text-sm',
							isSelf ? 'text-muted-foreground' : targetAsset.color.text,
						)}
					>
						{isSelf ? '1' : formatParityValue(value, targetAsset)}
					</td>
				)
			})}
			<td className="p-4 min-w-35">
				<SupplyCell asset={asset} />
			</td>
			<td className="p-4 text-muted-foreground text-sm">{getDynamicNote(asset)}</td>
		</tr>
	)
})

// Main parity table
export function ParityTable() {
	const t = useTranslations('parity')

	const filteredAssets = useFilteredAssets()
	const { assetMap, error } = useAssetData()

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('nanoScarcityParity')}</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="pb-0">
				<CardTitle>{t('nanoScarcityParity')}</CardTitle>
				<CardDescription>{t('tableDescription')}</CardDescription>
			</CardHeader>
			<CardContent className="p-0 whitespace-nowrap">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-muted-foreground text-sm">
								<th className="text-left p-4 font-medium">{t('asset')}</th>
								{filteredAssets.map((assetId) => (
									<th key={assetId} className="text-right p-4 font-medium">
										{assetMap[assetId].label}
									</th>
								))}
								<th className="text-right p-4 font-medium">{t('totalSupply')}</th>
								<th className="text-left p-4 font-medium">{t('note')}</th>
							</tr>
						</thead>
						<tbody>
							{filteredAssets.map((assetId) => (
								<ParityRow
									key={assetId}
									assetId={assetId}
									targetAssets={filteredAssets}
									assetMap={assetMap}
								/>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}
