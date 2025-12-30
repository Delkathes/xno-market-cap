'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Pencil, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { AssetData, AssetId } from '@/lib/asset-config'
import { parityFiatCurrenciesAtom } from '@/lib/currency-atoms'
import { cn } from '@/lib/utils'

import { useAssetData } from '@/hooks/use-asset-data'
import { calculateAllParities, getFilteredAssets } from '@/hooks/use-filtered-assets'

import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MarketDataError } from '@/components/market-data-error'

import { Skeleton } from './ui/skeleton'

// Format parity value for highlight cards (shorter format)
const formatHighlightValue = (value: number, asset: AssetData): string => {
	const { symbol, unit, type } = asset

	if (type === 'fiat') {
		return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
	}

	const decimals = type === 'commodity' ? 3 : 4
	return `${value.toFixed(decimals)} ${unit}`
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

// XNO parity highlight cards
export function ParityHighlight() {
	const t = useTranslations('parity')

	const { assetMap, isLoading, error } = useAssetData()

	const enabledFiats = useAtomValue(parityFiatCurrenciesAtom)

	const [xnoAmount, setXnoAmount] = useState(1)
	const [inputValue, setInputValue] = useState('1')
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)

	const containerRef = useRef<HTMLButtonElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Sync input value when popover opens
	// biome-ignore lint/correctness/useExhaustiveDependencies: <refocuses the whole input value and overwrites every time we try to type>
	useEffect(() => {
		if (isPopoverOpen) {
			setInputValue(xnoAmount.toString())
			// Focus and select the input when popover opens
			setTimeout(() => inputRef.current?.select(), 0)
		}
	}, [isPopoverOpen])

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
			? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5'
			: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'

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
										aria-label={t('clickToEditXnoAmount')}
									>
										<p className="text-sm text-muted-foreground mb-1 flex items-center justify-between">
											{asset.label}
											<Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
										</p>
										<p className={cn('text-xl font-bold font-mono', asset.color.text)}>
											{formatXnoDisplay(xnoAmount)}
										</p>
										<p className="mt-1 text-xs text-muted-foreground/50 sm:hidden">
											{t('clickToEdit')}
										</p>
										<p className="mt-1 text-xs text-muted-foreground/50 hidden sm:block">
											{t('clickOrScrollToEdit')}
										</p>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-3" align="start">
									<div className="space-y-2">
										<label htmlFor="xno-amount" className="text-sm font-medium">
											{t('xnoAmount')}
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
										<p className="text-xs text-muted-foreground">{t('pressEnterToConfirm')}</p>
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
											? t('noLimit')
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
