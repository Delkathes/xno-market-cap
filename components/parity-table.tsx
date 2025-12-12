'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { Infinity as InfinityIcon, Pencil, Settings, TrendingUp } from 'lucide-react'

import { type FiatCurrency, parityFiatCurrenciesAtom } from '@/lib/currency-atoms'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { MarketDataError } from '@/components/market-data-error'

// =============================================================================
// SINGLE SOURCE OF TRUTH - Asset Configuration (Static metadata)
// =============================================================================

type AssetType = 'crypto' | 'commodity' | 'fiat'

interface AssetConfig {
	id: string
	coingeckoId?: string // For live data fetching
	label: string
	unit: string
	symbol: string
	type: AssetType
	color: {
		bg: string
		text: string
	}
	// Static supply values (used as fallback or for non-crypto assets)
	staticSupply: {
		current: number
		max: number | null
	}
	note: string
}

// Asset configuration - metadata and fallback values
const ASSET_CONFIG: Record<string, AssetConfig> = {
	XNO: {
		id: 'XNO',
		coingeckoId: 'nano',
		label: 'Nano',
		unit: 'XNO',
		symbol: 'Ӿ',
		type: 'crypto',
		color: { bg: 'bg-[#209CE9]/20', text: 'text-[#209CE9]' },
		staticSupply: { current: 133_248_297, max: 133_248_297 },
		note: 'Fixed, fully distributed',
	},
	BTC: {
		id: 'BTC',
		coingeckoId: 'bitcoin',
		label: 'Bitcoin',
		unit: 'BTC',
		symbol: '₿',
		type: 'crypto',
		color: { bg: 'bg-[#F7931A]/20', text: 'text-[#F7931A]' },
		staticSupply: { current: 19_800_000, max: 21_000_000 },
		note: '~94% mined of 21M cap',
	},
	GOLD: {
		id: 'GOLD',
		label: 'Gold',
		unit: 'KG',
		symbol: 'Au',
		type: 'commodity',
		color: { bg: 'bg-[#FFD700]/20', text: 'text-[#B8860B]' },
		staticSupply: { current: 209_000_000, max: 244_000_000 },
		note: '~86% of estimated total mined',
	},
	USD: {
		id: 'USD',
		label: 'US Dollar',
		unit: 'USD',
		symbol: '$',
		type: 'fiat',
		color: { bg: 'bg-green-500/20', text: 'text-green-600' },
		staticSupply: { current: 20_800_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	EUR: {
		id: 'EUR',
		label: 'Euro',
		unit: 'EUR',
		symbol: '€',
		type: 'fiat',
		color: { bg: 'bg-blue-500/20', text: 'text-blue-600' },
		staticSupply: { current: 16_000_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	GBP: {
		id: 'GBP',
		label: 'British Pound',
		unit: 'GBP',
		symbol: '£',
		type: 'fiat',
		color: { bg: 'bg-purple-500/20', text: 'text-purple-600' },
		staticSupply: { current: 3_200_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	JPY: {
		id: 'JPY',
		label: 'Japanese Yen',
		unit: 'JPY',
		symbol: '¥',
		type: 'fiat',
		color: { bg: 'bg-red-500/20', text: 'text-red-600' },
		staticSupply: { current: 2_100_000_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	CHF: {
		id: 'CHF',
		label: 'Swiss Franc',
		unit: 'CHF',
		symbol: 'Fr',
		type: 'fiat',
		color: { bg: 'bg-red-600/20', text: 'text-red-700' },
		staticSupply: { current: 1_100_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	CAD: {
		id: 'CAD',
		label: 'Canadian Dollar',
		unit: 'CAD',
		symbol: 'C$',
		type: 'fiat',
		color: { bg: 'bg-red-500/20', text: 'text-red-500' },
		staticSupply: { current: 2_400_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	AUD: {
		id: 'AUD',
		label: 'Australian Dollar',
		unit: 'AUD',
		symbol: 'A$',
		type: 'fiat',
		color: { bg: 'bg-yellow-500/20', text: 'text-yellow-600' },
		staticSupply: { current: 2_800_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
}

// Runtime asset data (combines config with live/resolved supply)
interface AssetData extends AssetConfig {
	currentSupply: number
	maxSupply: number | null
	isLive: boolean
}

type AssetId = keyof typeof ASSET_CONFIG

// =============================================================================
// DERIVED DATA - Computed from source of truth
// =============================================================================

const getAllAssetIds = (): AssetId[] => Object.keys(ASSET_CONFIG) as AssetId[]

const getAssetsByType = (type: AssetType): AssetId[] => getAllAssetIds().filter((id) => ASSET_CONFIG[id].type === type)

const getCoreAssets = (): AssetId[] => [...getAssetsByType('crypto'), ...getAssetsByType('commodity')]

const getFiatAssets = (): FiatCurrency[] => getAssetsByType('fiat') as FiatCurrency[]

// Static derivations (computed once)
const CORE_ASSETS = getCoreAssets()
const FIAT_ASSETS = getFiatAssets()

// =============================================================================
// PURE FUNCTIONS - Data Transformation
// =============================================================================

// Build asset data map with live values where available
type CryptoMarketData = {
	id: string
	circulating_supply?: number
	max_supply?: number | null
}

const buildAssetDataMap = (marketData: CryptoMarketData[] | undefined): Record<AssetId, AssetData> => {
	const assetMap: Record<string, AssetData> = {}

	for (const [id, config] of Object.entries(ASSET_CONFIG)) {
		// Try to find live data for crypto assets
		const liveData = config.coingeckoId ? marketData?.find((c) => c.id === config.coingeckoId) : undefined

		const hasLiveData = liveData?.circulating_supply !== undefined

		assetMap[id] = {
			...config,
			currentSupply: hasLiveData ? liveData.circulating_supply! : config.staticSupply.current,
			maxSupply: hasLiveData ? (liveData.max_supply ?? config.staticSupply.max) : config.staticSupply.max,
			isLive: hasLiveData,
		}
	}

	return assetMap as Record<AssetId, AssetData>
}

// Calculate parity between two assets
const calculateParity = (fromId: AssetId, toId: AssetId, assetMap: Record<AssetId, AssetData>): number => {
	const fromSupply = assetMap[fromId].currentSupply
	const toSupply = assetMap[toId].currentSupply
	return toSupply / fromSupply
}

// Calculate future parity using max supply
const calculateFutureParity = (fromId: AssetId, toId: AssetId, assetMap: Record<AssetId, AssetData>): number | null => {
	const fromAsset = assetMap[fromId]
	const toAsset = assetMap[toId]

	if (fromId === 'XNO') {
		if (toId === 'XNO') return null
		if (toAsset.maxSupply === null) return Number.POSITIVE_INFINITY
		if (toAsset.currentSupply >= toAsset.maxSupply * 0.99) return null
		return toAsset.maxSupply / fromAsset.currentSupply
	}

	return null
}

// Calculate all parities for a given asset
const calculateAllParities = (
	fromId: AssetId,
	toIds: AssetId[],
	assetMap: Record<AssetId, AssetData>,
): Record<AssetId, number> =>
	Object.fromEntries(toIds.map((toId) => [toId, calculateParity(fromId, toId, assetMap)])) as Record<AssetId, number>

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
		if (id === 'JPY') {
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

// Format parity value for highlight cards (shorter format)
const formatHighlightValue = (value: number, asset: AssetData): string => {
	const { symbol, unit, type } = asset

	if (type === 'fiat') {
		return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
	}

	const decimals = type === 'commodity' ? 3 : 4
	return `${value.toFixed(decimals)} ${unit}`
}

// Filter assets by enabled fiats
const getFilteredAssets = (enabledFiats: FiatCurrency[]): AssetId[] => [...CORE_ASSETS, ...enabledFiats]

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
// HOOKS
// =============================================================================

// Hook to get asset data with live values
function useAssetData(): { assetMap: Record<AssetId, AssetData>; isLoading: boolean; error: Error | null } {
	const { data, isLoading, error } = useMarketData()

	const assetMap = useMemo(() => buildAssetDataMap(data), [data])

	return { assetMap, isLoading, error }
}

// Hook to get filtered assets based on enabled fiats
function useFilteredAssets(): AssetId[] {
	const [enabledFiats] = useAtom(parityFiatCurrenciesAtom)
	return useMemo(() => getFilteredAssets(enabledFiats), [enabledFiats])
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
function ParityTableSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Absolute Scarcity Parity</CardTitle>
				<CardDescription>Loading market data...</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_) => (
						<Skeleton key={`${_}-parity-table-skeleton-item`} className="h-16 w-full" />
					))}
				</div>
			</CardContent>
		</Card>
	)
}

// Loading skeleton for highlight
function HighlightSkeleton() {
	return (
		<section>
			<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_) => (
					<Skeleton key={`${_}-highlight-skeleton-item`} className="h-24 rounded-lg" />
				))}
			</div>
		</section>
	)
}

// Settings popover for fiat currency selection
function ParitySettingsPopover() {
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
					<span className="sr-only">Fiat currency settings</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64" align="end">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Fiat Currencies</h4>
						<p className="text-sm text-muted-foreground">Select which currencies to display</p>
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
							'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
							asset.color.bg,
							asset.color.text,
						)}
					>
						{asset.symbol}
					</div>
					<div>
						<p className="font-semibold">{asset.label}</p>
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
			<td className="p-4 min-w-[140px]">
				<SupplyCell asset={asset} />
			</td>
			<td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{getDynamicNote(asset)}</td>
		</tr>
	)
})

// Main parity table
export function ParityTable() {
	const filteredAssets = useFilteredAssets()
	const { assetMap, isLoading, error } = useAssetData()

	if (isLoading) {
		return <ParityTableSkeleton />
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Absolute Scarcity Parity</CardTitle>
				</CardHeader>
				<CardContent>
					<MarketDataError error={error} />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Absolute Scarcity Parity</CardTitle>
				<CardDescription>
					Value based on total supply ratio: 1 unit of Asset A = (Total Supply of B) / (Total Supply of A)
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border">
							<tr className="text-muted-foreground text-sm">
								<th className="text-left p-4 font-medium">Asset</th>
								{filteredAssets.map((assetId) => (
									<th key={assetId} className="text-right p-4 font-medium">
										{assetMap[assetId].label}
									</th>
								))}
								<th className="text-right p-4 font-medium">Total Supply</th>
								<th className="text-left p-4 font-medium hidden md:table-cell">Note</th>
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

// XNO parity highlight cards
export function XNOParityHighlight() {
	const [enabledFiats] = useAtom(parityFiatCurrenciesAtom)
	const { assetMap, isLoading, error } = useAssetData()
	const [xnoAmount, setXnoAmount] = useState(1)
	const [inputValue, setInputValue] = useState('1')
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)
	const containerRef = useRef<HTMLButtonElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Sync input value when popover opens
	useEffect(() => {
		if (isPopoverOpen) {
			setInputValue(xnoAmount.toString())
			// Focus and select the input when popover opens
			setTimeout(() => inputRef.current?.select(), 0)
		}
	}, [isPopoverOpen, xnoAmount])

	const handleInputChange = useCallback((value: string) => {
		setInputValue(value)
		const parsed = parseFloat(value)
		if (!Number.isNaN(parsed) && parsed >= 0) {
			setXnoAmount(parsed)
		}
	}, [])

	const handleInputBlur = useCallback(() => {
		const parsed = parseFloat(inputValue)
		if (Number.isNaN(parsed) || parsed < 0) {
			setXnoAmount(1)
			setInputValue('1')
		} else {
			setInputValue(parsed.toString())
		}
	}, [inputValue])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleInputBlur()
				setIsPopoverOpen(false)
			}
			if (e.key === 'Escape') {
				setIsPopoverOpen(false)
			}
		},
		[handleInputBlur],
	)

	const adjustAmount = useCallback((delta: number) => {
		setXnoAmount((prev) => {
			const step = prev >= 100 ? 10 : prev >= 10 ? 1 : 0.1
			const newValue = prev + delta * step
			const clamped = Math.max(0.1, Math.round(newValue * 10) / 10)
			setInputValue(clamped.toString())
			return clamped
		})
	}, [])

	// Handle mousewheel on the XNO card area
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			e.preventDefault()
			const delta = e.deltaY < 0 ? 1 : -1
			adjustAmount(delta)
		},
		[adjustAmount],
	)

	const displayAssets = useMemo(() => getFilteredAssets(enabledFiats), [enabledFiats])

	const parities = useMemo(() => calculateAllParities('XNO', displayAssets, assetMap), [displayAssets, assetMap])

	const futureParities = useMemo(
		() =>
			Object.fromEntries(displayAssets.map((id) => [id, calculateFutureParity('XNO', id, assetMap)])) as Record<
				AssetId,
				number | null
			>,
		[displayAssets, assetMap],
	)

	if (isLoading) {
		return <HighlightSkeleton />
	}

	if (error) {
		return <MarketDataError error={error} compact />
	}

	// Determine grid columns based on number of items
	const totalItems = displayAssets.length
	const gridClass =
		totalItems <= 5
			? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
			: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'

	const formatXnoDisplay = (amount: number) =>
		amount >= 1000 ? `${amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} XNO` : `${amount} XNO`

	return (
		<section>
			<div className={cn('grid gap-3', gridClass)}>
				{displayAssets.map((assetId) => {
					const asset = assetMap[assetId]
					const isXNO = assetId === 'XNO'
					const value = parities[assetId] * xnoAmount
					const futureValue = futureParities[assetId]

					// XNO card with popover for amount input
					if (isXNO) {
						return (
							<Popover key={assetId} open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
								<PopoverTrigger asChild>
									<button
										ref={containerRef}
										type="button"
										onWheel={handleWheel}
										className="p-4 rounded-lg border bg-[#209CE9]/10 border-[#209CE9]/30 cursor-pointer hover:bg-[#209CE9]/15 transition-colors group"
										tabIndex={0}
										aria-label="Click to edit XNO amount"
									>
										<p className="text-sm text-muted-foreground mb-1 flex items-center justify-between">
											{asset.label}
											<Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
										</p>
										<p className={cn('text-xl font-bold font-mono', asset.color.text)}>
											{formatXnoDisplay(xnoAmount)}
										</p>
										<p className="mt-1 text-xs text-muted-foreground/50">Click or scroll to edit</p>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-3" align="start">
									<div className="space-y-2">
										<label htmlFor="xno-amount" className="text-sm font-medium">
											XNO Amount
										</label>
										<div className="relative">
											<Input
												ref={inputRef}
												id="xno-amount"
												type="number"
												min={0.1}
												step={0.1}
												value={inputValue}
												onChange={(e) => handleInputChange(e.target.value)}
												onBlur={handleInputBlur}
												onKeyDown={handleKeyDown}
												className="font-mono pr-8"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
												Ӿ
											</span>
										</div>
										<p className="text-xs text-muted-foreground">Press Enter to confirm</p>
									</div>
								</PopoverContent>
							</Popover>
						)
					}

					return (
						<div key={assetId} className="p-4 rounded-lg border bg-background/50 border-border">
							<p className="text-sm text-muted-foreground mb-1">{asset.label}</p>
							<p className={cn('text-xl font-bold font-mono', asset.color.text)}>
								{formatHighlightValue(value, asset)}
							</p>
							{futureValue !== null && (
								<p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/70">
									<TrendingUp className="h-3 w-3 text-emerald-500/70 mr-1" />
									<span className="font-mono">
										{futureValue === Number.POSITIVE_INFINITY
											? 'no limit'
											: `${assetId === 'GOLD' ? 'approx ' : assetId === 'BTC' ? 'to fixed ' : ''}${formatHighlightValue(futureValue * xnoAmount, asset)}`}
									</span>
								</p>
							)}
						</div>
					)
				})}
			</div>
		</section>
	)
}

export { ParitySettingsPopover }
