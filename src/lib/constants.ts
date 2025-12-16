// XNO Circulating Supply (fixed supply, no inflation)
export const XNO_CIRCULATING_SUPPLY = 133246167.96530801

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
export const BLOCKLATTICE_ACCOUNT_URL = 'https://blocklattice.io/account'

// WebSocket configuration for payment detection
export const WS_ENDPOINTS = ['wss://ws.nano.to'] as const
export const WS_INITIAL_RECONNECT_DELAY = 3000
export const WS_MAX_RECONNECT_DELAY = 30000
export const WS_MAX_RECONNECT_ATTEMPTS = 10

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

/**
 * Validates all donation wallet addresses from environment variables
 * Throws an error if any configured wallet address is invalid
 * Empty wallet addresses are skipped (feature disabled)
 */
export function validateDonationWallets(): { valid: boolean; errors: string[] } {
	// Dynamic import to avoid circular dependency at module load
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { isValidNanoAddress } = require('./nano-utils') as { isValidNanoAddress: (address: string) => boolean }

	const errors: string[] = []

	// Validate final wallet
	if (DONATION_WALLET_FINAL && !isValidNanoAddress(DONATION_WALLET_FINAL)) {
		errors.push(`Invalid DONATION_WALLET_FINAL: ${DONATION_WALLET_FINAL}`)
	}

	// Validate milestone wallets
	for (const milestone of DONATION_MILESTONES) {
		if (milestone.walletAddress && !isValidNanoAddress(milestone.walletAddress)) {
			errors.push(`Invalid wallet for milestone "${milestone.id}": ${milestone.walletAddress}`)
		}
	}

	return { valid: errors.length === 0, errors }
}
