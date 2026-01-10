import { NextResponse } from 'next/server'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { isValidNanoAddress, rawToXno } from '@/lib/nano-utils'
import { getSecurityHeaders } from '@/lib/security-headers'
import { validateNanoBalanceResponse } from '@/lib/validation'

import { env } from '@/env'

export const DONATION_MILESTONES = [
	{
		id: 'development',
		targetXno: 3000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT,
		icon: 'rocket',
		rewardCount: 3,
	},
	{
		id: 'maintenance',
		targetXno: 18000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE,
		icon: 'shield',
		rewardCount: 3,
	},
	{
		id: 'opensource',
		targetXno: 4000,
		walletAddress: env.NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE,
		icon: 'code',
		rewardCount: 3,
	},
]

// Path-based caching works reliably
export const revalidate = 60 // 60 seconds

const REQUEST_TIMEOUT_MS = 10000
const DONATION_WALLET_FINAL = env.NEXT_PUBLIC_DONATION_WALLET_FINAL

// Round-robin index for fair RPC endpoint rotation
let rpcEndpointIndex = 0

function getNextRpcEndpoint(): string {
	const endpoint = RPC_ENDPOINTS[rpcEndpointIndex]
	rpcEndpointIndex = (rpcEndpointIndex + 1) % RPC_ENDPOINTS.length
	return endpoint
}

interface MilestoneBalance {
	id: string
	balance: number
}

interface DonationBalanceResponse {
	milestoneBalances: Record<string, number>
	totalDonations: number
	allMilestonesComplete: boolean
	activeWalletAddress: string | undefined
}

async function fetchWalletBalance(walletAddress: string): Promise<number> {
	if (!walletAddress || !isValidNanoAddress(walletAddress)) {
		return 0
	}

	const endpoint = getNextRpcEndpoint()

	try {
		const response = await fetchWithTimeout(
			endpoint,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'account_balance',
					account: walletAddress,
				}),
				cache: 'no-store',
			},
			REQUEST_TIMEOUT_MS,
		)

		if (response.ok) {
			const data = await response.json()
			const validation = validateNanoBalanceResponse(data)
			if (validation.success && validation.balance) {
				return rawToXno(validation.balance)
			}
		}
	} catch (error) {
		console.error(`Failed to fetch balance for ${walletAddress}:`, error)
	}

	return 0
}

export async function GET(): Promise<NextResponse<DonationBalanceResponse>> {
	// Fetch all milestone balances in parallel
	const results = await Promise.all(
		DONATION_MILESTONES.map(async (milestone): Promise<MilestoneBalance> => {
			const balance = await fetchWalletBalance(milestone.walletAddress)
			return { id: milestone.id, balance }
		}),
	)

	const milestoneBalances: Record<string, number> = {}
	for (const { id, balance } of results) {
		milestoneBalances[id] = balance
	}

	// Calculate totals
	const totalDonations = Object.values(milestoneBalances).reduce((sum, balance) => sum + balance, 0)

	const allMilestonesComplete = DONATION_MILESTONES.every((milestone) => {
		const balance = milestoneBalances[milestone.id] || 0
		return balance >= milestone.targetXno
	})

	// Determine active wallet
	let activeWalletAddress: string | undefined = DONATION_WALLET_FINAL

	if (!allMilestonesComplete) {
		for (const milestone of DONATION_MILESTONES) {
			const balance = milestoneBalances[milestone.id] || 0
			if (balance < milestone.targetXno) {
				activeWalletAddress = milestone.walletAddress
				break
			}
		}
	}

	const response: DonationBalanceResponse = {
		milestoneBalances,
		totalDonations,
		allMilestonesComplete,
		activeWalletAddress,
	}

	return NextResponse.json(response, {
		headers: {
			...getSecurityHeaders(),
			'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
		},
	})
}
