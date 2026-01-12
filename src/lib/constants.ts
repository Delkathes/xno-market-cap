import { env } from '@/env'

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

// Donation milestones
export type MilestoneId = 'development' | 'maintenance' | 'opensource'
export type MilestoneIcon = 'rocket' | 'shield' | 'code' | 'heart'

export interface DonationMilestoneConfig {
	id: MilestoneId
	targetXno: number
	walletAddress: string
	icon: MilestoneIcon
	rewardCount: number
}

export const DONATION_MILESTONES: DonationMilestoneConfig[] = [
	{
		id: 'development',
		targetXno: 1500,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT,
		icon: 'rocket',
		rewardCount: 3,
	},
	{
		id: 'opensource',
		targetXno: 2500,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE,
		icon: 'code',
		rewardCount: 3,
	},
	{
		id: 'maintenance',
		targetXno: 5000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE,
		icon: 'shield',
		rewardCount: 3,
	},
] as const

// Block explorer URL
export const BLOCKLATTICE_URL = 'https://blocklattice.io' as const

// WebSocket configuration for payment detection
export const WS_ENDPOINTS = [
	'wss://ws.nano.to',
	'wss://nanoslo.0x.no/websocket',
	'wss://node.somenano.com/websocket',
	'wss://rainstorm.city/websocket',
] as const
// RPC endpoints for balance checks
export const RPC_ENDPOINTS = [
	'https://rpc.nano.to',
	'https://app.natrium.io/api',
	'https://nanoslo.0x.no/proxy',
	'https://node.somenano.com/proxy',
	'https://rainstorm.city/api',
] as const
