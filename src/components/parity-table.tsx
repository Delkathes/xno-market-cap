'use client'

import { memo, useMemo } from 'react'
import { useAtom } from 'jotai'
import { Infinity as InfinityIcon, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { type AssetData, type AssetId, FIAT_ASSETS } from '@/lib/asset-config'
import type { FiatCurrency } from '@/lib/constants'
import { parityFiatCurrenciesAtom } from '@/lib/currency-atoms'
import { formatMaxSupply, formatParityValue, formatSupply } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { useAssetData } from '@/hooks/use-asset-data'
import { calculateAllParities, useFilteredAssets } from '@/hooks/use-filtered-assets'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MarketDataError } from '@/components/market-data-error'

// =============================================================================
// PURE FUNCTIONS - Data Transformation
// =============================================================================

// Calculate supply percentage (current / max)
const getSupplyPercentage = (asset: AssetData): number | null => {
	if (asset.maxSupply === null) return null
	return (asset.currentSupply / asset.maxSupply) * 100
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Supply cell with progress bar
interface SupplyCellProps {
	asset: AssetData
}

function SupplyCell({ asset }: SupplyCellProps) {
	const t = useTranslations('parity')
	const percentage = getSupplyPercentage(asset)
	const isInfinite = asset.maxSupply === null
	const isFullyDistributed = percentage === 100

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums">
				<span className="text-primary">
					{formatSupply(asset.currentSupply, {
						type: asset.type,
						symbol: asset.symbol,
						unit: asset.type === 'commodity' ? 'kg' : undefined,
					})}
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
					<span className="text-muted-foreground">
						/{' '}
						{formatMaxSupply(asset.maxSupply, {
							type: asset.type,
							symbol: asset.symbol,
							unit: asset.type === 'commodity' ? 'kg' : undefined,
						})}
					</span>
				)}
			</div>
			<div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
				{isInfinite ? (
					// Infinite supply - animated gradient bar
					<div className="h-full w-full rounded-sm bg-linear-to-r from-destructive/30 via-destructive/60 to-destructive/30 overflow-hidden">
						<div
							className="h-full w-full bg-linear-to-r from-transparent via-destructive/80 to-transparent animate-pulse"
							style={{ animationDuration: '2s' }}
						/>
					</div>
				) : (
					<div
						className={cn(
							'h-full rounded-sm transition-all',
							isFullyDistributed ? 'bg-emerald-500' : 'bg-primary',
						)}
						style={{ width: `${percentage ?? 0}%` }}
					/>
				)}
			</div>
			<div className="text-right font-mono text-[10px] text-muted-foreground">
				{isInfinite ? (
					<span className="text-destructive/80">{t('unboundedSupply')}</span>
				) : isFullyDistributed ? (
					<span className="text-emerald-600">{t('fullyDistributed')}</span>
				) : (
					<span>{t('ofMax', { percentage: percentage !== null ? percentage.toFixed(1) : '0' })}</span>
				)}
			</div>
		</div>
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
				<Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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
									className="justify-start cursor-pointer"
									onClick={() => toggleFiat(fiat)}
								>
									<span className="w-8 font-mono">{asset.symbol}</span>
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
		<tr
			className={cn(
				'border-b border-l-2 border-border border-l-transparent transition-colors hover:bg-muted/40',
				isXNO && 'border-l-[#209CE9] bg-[#209CE9]/[0.05]',
			)}
		>
			<td className="px-3 py-1.5">
				<div className="flex items-center gap-3">
					<div
						className={cn(
							'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold',
							asset.color.bg,
							asset.color.text,
						)}
					>
						{asset.symbol}
					</div>
					<div>
						<p className="font-semibold text-sm sm:text-base line-clamp-1">{asset.label}</p>
						<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							1 {asset.unit}
						</p>
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
							'px-3 py-1.5 text-right font-mono text-sm font-medium tabular-nums',
							isSelf ? 'text-muted-foreground' : targetAsset.color.text,
						)}
					>
						{isSelf
							? '1'
							: formatParityValue(value, {
									symbol: targetAsset.symbol,
									unit: targetAsset.unit,
									type: targetAsset.type,
									currency: targetAsset.id as FiatCurrency,
								})}
					</td>
				)
			})}
			<td className="px-3 py-1.5 min-w-35">
				<SupplyCell asset={asset} />
			</td>
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
			<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
				<MarketDataError error={error} compact />
			</div>
		)
	}

	return (
		<div className="rounded-md border bg-card">
			<div className="relative max-h-150 overflow-auto rounded-md">
				<table className="w-full whitespace-nowrap">
					<thead className="sticky top-0 z-10 border-b border-border bg-card">
						<tr className="text-foreground text-sm">
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-left">
								{t('asset')}
							</th>
							{filteredAssets.map((assetId) => (
								<th
									key={assetId}
									className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right"
								>
									{assetMap[assetId].label}
								</th>
							))}
							<th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-right">
								{t('totalSupply')}
							</th>
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
		</div>
	)
}
