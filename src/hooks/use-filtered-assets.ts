import { useMemo } from 'react'
import { useAtom } from 'jotai'

import { type AssetData, type AssetId, CORE_ASSETS } from '@/lib/asset-config'
import type { FiatCurrency } from '@/lib/constants'
import { parityFiatCurrenciesAtom } from '@/lib/currency-atoms'

// Hook to get filtered assets based on enabled fiats
export function useFilteredAssets(): AssetId[] {
	const [enabledFiats] = useAtom(parityFiatCurrenciesAtom)
	return useMemo(() => getFilteredAssets(enabledFiats), [enabledFiats])
}
// Filter assets by enabled fiats
export const getFilteredAssets = (enabledFiats: FiatCurrency[]): AssetId[] => [...CORE_ASSETS, ...enabledFiats]

// Calculate parity between two assets
export const calculateParity = (fromId: AssetId, toId: AssetId, assetMap: Record<AssetId, AssetData>): number => {
	const fromSupply = assetMap[fromId].currentSupply
	const toSupply = assetMap[toId].currentSupply
	return toSupply / fromSupply
}

// Calculate all parities for a given asset
export const calculateAllParities = (
	fromId: AssetId,
	toIds: AssetId[],
	assetMap: Record<AssetId, AssetData>,
): Record<AssetId, number> =>
	Object.fromEntries(toIds.map((toId) => [toId, calculateParity(fromId, toId, assetMap)])) as Record<AssetId, number>
