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
