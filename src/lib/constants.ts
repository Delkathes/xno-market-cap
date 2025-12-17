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

// Donation configuration - Final wallet for post-goal "rewardless" donations
export const DONATION_WALLET_FINAL = process.env.NEXT_PUBLIC_DONATION_WALLET_FINAL || ''

export const ALLOWED_GOAL_ORIGINS = [
	/^https:\/\/.*\.vercel\.app$/,
	/^https:\/\/.*\.netlify\.app$/,
	/^http:\/\/localhost(:\d+)?$/,
	// /^http:\/\/127\.0\.0\.1(:\d+)?$/,
]

// Fixed donation amount options (XNO)
export const DONATION_FIXED_AMOUNTS = [1, 5, 10, 25, 50] as const

// Block explorer URL
export const BLOCKLATTICE_ACCOUNT_URL = 'https://blocklattice.io/account' as const

// WebSocket configuration for payment detection
export const WS_ENDPOINTS = ['wss://ws.nano.to'] as const
// RPC endpoints for balance checks
export const RPC_ENDPOINTS = ['https://rpc.nano.to'] as const

// Donation milestones - each milestone has its own wallet address
export interface DonationMilestone {
	id: string
	title: string
	description: string
	targetXno: number // Per-milestone target (not cumulative)
	walletAddress: string
	icon: 'rocket' | 'shield' | 'code' | 'heart'
	rewards: string[]
}

export const DONATION_MILESTONES: DonationMilestone[] = [
	{
		id: 'development',
		title: 'Development Costs',
		description: 'Cover initial development expenses',
		targetXno: 5000,
		walletAddress: process.env.NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT || '',
		icon: 'rocket',
		rewards: [
			'Development time compensation',
			'Initial hosting & infrastructure',
			'LLM token usage for code generation',
		],
	},
	{
		id: 'maintenance',
		title: 'Maintenance Fund',
		description: 'Secure ongoing operations',
		targetXno: 25000,
		walletAddress: process.env.NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE || '',
		icon: 'shield',
		rewards: ['Full time XNO commitment for a year', 'Hosting + API costs', 'Bug fixes & improvements'],
	},
	{
		id: 'opensource',
		title: 'Open Source',
		description: 'Release to the community',
		targetXno: 10000,
		walletAddress: process.env.NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE || '',
		icon: 'code',
		rewards: ['Full source code on GitHub', 'One-click free host deployment', 'Community-driven development'],
	},
]

// Helper to get total donation goal across all milestones
export const DONATION_GOAL_XNO = DONATION_MILESTONES.reduce((sum, m) => sum + m.targetXno, 0)
