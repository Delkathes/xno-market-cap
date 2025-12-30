import { type AssetType, CRYPTO_IDS, CryptoTicker, FIAT_CURRENCY_CONFIG, FiatCurrency } from '@/lib/constants'

// =============================================================================
// SINGLE SOURCE OF TRUTH - Asset Configuration (Static metadata)
// =============================================================================

// Runtime asset data (combines config with live/resolved supply)
export interface AssetData extends AssetConfig {
	currentSupply: number
	maxSupply: number | null
	isLive: boolean
}

export type AssetId = keyof typeof ASSET_CONFIG

export interface AssetConfig {
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
export const ASSET_CONFIG: Record<string, AssetConfig> = {
	XNO: {
		id: CryptoTicker.XNO,
		coingeckoId: CRYPTO_IDS.NANO,
		label: 'Nano',
		unit: CryptoTicker.XNO,
		symbol: 'Ӿ',
		type: 'crypto',
		color: { bg: 'bg-[#209CE9]/20', text: 'text-[#209CE9]' },
		staticSupply: { current: 133_248_297, max: 133_248_297 },
		note: 'Fixed, fully distributed',
	},
	BTC: {
		id: CryptoTicker.BTC,
		coingeckoId: CRYPTO_IDS.BITCOIN,
		label: 'Bitcoin',
		unit: CryptoTicker.BTC,
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
	// Fiat currencies - derive label and symbol from FIAT_CURRENCY_CONFIG
	USD: {
		id: FiatCurrency.USD,
		label: FIAT_CURRENCY_CONFIG.USD.label,
		unit: FiatCurrency.USD,
		symbol: FIAT_CURRENCY_CONFIG.USD.symbol,
		type: 'fiat',
		color: { bg: 'bg-green-500/20', text: 'text-green-600' },
		staticSupply: { current: 20_800_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	EUR: {
		id: FiatCurrency.EUR,
		label: FIAT_CURRENCY_CONFIG.EUR.label,
		unit: FiatCurrency.EUR,
		symbol: FIAT_CURRENCY_CONFIG.EUR.symbol,
		type: 'fiat',
		color: { bg: 'bg-blue-500/20', text: 'text-blue-600' },
		staticSupply: { current: 16_000_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	GBP: {
		id: FiatCurrency.GBP,
		label: FIAT_CURRENCY_CONFIG.GBP.label,
		unit: FiatCurrency.GBP,
		symbol: FIAT_CURRENCY_CONFIG.GBP.symbol,
		type: 'fiat',
		color: { bg: 'bg-purple-500/20', text: 'text-purple-600' },
		staticSupply: { current: 3_200_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	JPY: {
		id: FiatCurrency.JPY,
		label: FIAT_CURRENCY_CONFIG.JPY.label,
		unit: FiatCurrency.JPY,
		symbol: FIAT_CURRENCY_CONFIG.JPY.symbol,
		type: 'fiat',
		color: { bg: 'bg-red-500/20', text: 'text-red-600' },
		staticSupply: { current: 2_100_000_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	CHF: {
		id: FiatCurrency.CHF,
		label: FIAT_CURRENCY_CONFIG.CHF.label,
		unit: FiatCurrency.CHF,
		symbol: FIAT_CURRENCY_CONFIG.CHF.symbol,
		type: 'fiat',
		color: { bg: 'bg-red-600/20', text: 'text-red-700' },
		staticSupply: { current: 1_100_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	CAD: {
		id: FiatCurrency.CAD,
		label: FIAT_CURRENCY_CONFIG.CAD.label,
		unit: FiatCurrency.CAD,
		symbol: FIAT_CURRENCY_CONFIG.CAD.symbol,
		type: 'fiat',
		color: { bg: 'bg-red-500/20', text: 'text-red-500' },
		staticSupply: { current: 2_400_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
	AUD: {
		id: FiatCurrency.AUD,
		label: FIAT_CURRENCY_CONFIG.AUD.label,
		unit: FiatCurrency.AUD,
		symbol: FIAT_CURRENCY_CONFIG.AUD.symbol,
		type: 'fiat',
		color: { bg: 'bg-yellow-500/20', text: 'text-yellow-600' },
		staticSupply: { current: 2_800_000_000_000, max: null },
		note: 'M2 Supply, no cap',
	},
}

// =============================================================================
// DERIVED DATA - Computed from source of truth
// =============================================================================

export const getAllAssetIds = (): AssetId[] => Object.keys(ASSET_CONFIG) as AssetId[]

export const getAssetsByType = (type: AssetType): AssetId[] =>
	getAllAssetIds().filter((id) => ASSET_CONFIG[id].type === type)

export const getCoreAssets = (): AssetId[] => [...getAssetsByType('crypto'), ...getAssetsByType('commodity')]

export const getFiatAssets = (): FiatCurrency[] => getAssetsByType('fiat') as FiatCurrency[]

// Static derivations (computed once)
export const CORE_ASSETS = getCoreAssets()
export const FIAT_ASSETS = getFiatAssets()
