export const LOCALES = ['en', 'nl', 'es', 'it', 'de', 'fr'] as const
export const DEFAULT_LOCALE = 'en' as const

export enum FiatCurrency {
	USD = 'USD',
	EUR = 'EUR',
	GBP = 'GBP',
	JPY = 'JPY',
	CHF = 'CHF',
	CAD = 'CAD',
	AUD = 'AUD',
}

// Fiat currency configuration (symbol, label)
export const FIAT_CURRENCY_CONFIG: Record<FiatCurrency, { symbol: string; label: string }> = {
	[FiatCurrency.USD]: { symbol: '$', label: 'US Dollar' },
	[FiatCurrency.EUR]: { symbol: '€', label: 'Euro' },
	[FiatCurrency.GBP]: { symbol: '£', label: 'British Pound' },
	[FiatCurrency.JPY]: { symbol: '¥', label: 'Japanese Yen' },
	[FiatCurrency.CHF]: { symbol: 'Fr', label: 'Swiss Franc' },
	[FiatCurrency.CAD]: { symbol: 'C$', label: 'Canadian Dollar' },
	[FiatCurrency.AUD]: { symbol: 'A$', label: 'Australian Dollar' },
} as const

// CoinGecko cryptocurrency IDs (lowercase, used for API calls)
export const CRYPTO_IDS = {
	NANO: 'nano',
	BITCOIN: 'bitcoin',
	ETHEREUM: 'ethereum',
} as const
export type CryptoId = (typeof CRYPTO_IDS)[keyof typeof CRYPTO_IDS]

// Crypto tickers (uppercase, used for display)
export enum CryptoTicker {
	XNO = 'XNO',
	BTC = 'BTC',
	ETH = 'ETH',
}

// Brand colors for cryptocurrencies (hex values)
export const CRYPTO_COLORS = {
	XNO: '#209CE9',
	BTC: '#F7931A',
	ETH: '#9357F4',
	XRP: '#23292F',
	BNB: '#F3BA2F',
	SOL: '#9945FF',
	OTHERS: '#666666',
} as const

// =============================================================================
// ASSET TYPE CONSTANTS
// =============================================================================

export const ASSET_TYPES = ['crypto', 'commodity', 'fiat'] as const
export type AssetType = (typeof ASSET_TYPES)[number]

// =============================================================================
// DONATION CONFIGURATION
// =============================================================================

export const ALLOWED_GOAL_ORIGINS = [
	/^https:\/\/.*\.vercel\.app$/,
	/^https:\/\/.*\.netlify\.app$/,
	/^http:\/\/localhost(:\d+)?$/,
	// /^http:\/\/127\.0\.0\.1(:\d+)?$/,
] as const

// Fixed donation amount options (XNO)
export const DONATION_FIXED_AMOUNTS = [1, 5, 10, 25, 50] as const

// Block explorer URL
export const BLOCKLATTICE_URL = 'https://blocklattice.io' as const

// WebSocket configuration for payment detection
export const WS_ENDPOINTS = ['wss://ws.nano.to'] as const
// RPC endpoints for balance checks
export const RPC_ENDPOINTS = ['https://rpc.nano.to'] as const
