import { useMemo } from 'react'

import { ASSET_CONFIG, type AssetData, type AssetId } from '@/lib/asset-config'
import type { CryptoData } from '@/lib/types'

import { useMarketData } from './use-market-data'

// Hook to get asset data with live values
export function useAssetData(): { assetMap: Record<AssetId, AssetData>; isLoading: boolean; error: Error | null } {
	const { data, isLoading, error } = useMarketData()

	const assetMap = useMemo(() => buildAssetDataMap(data), [data])

	return { assetMap, isLoading, error }
}

const buildAssetDataMap = (marketData: CryptoData[] | undefined): Record<AssetId, AssetData> => {
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

	return assetMap
}
