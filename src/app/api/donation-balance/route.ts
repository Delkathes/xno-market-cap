import { type NextRequest, NextResponse } from 'next/server'

import { isAllowedOrigin } from '@/lib/allowed-hosts'
import { DONATION_MILESTONES, RPC_ENDPOINTS } from '@/lib/constants'
import { isValidNanoAddress, rawToXno } from '@/lib/nano-utils'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getSecurityHeaders } from '@/lib/security-headers'
import { validateNanoBalanceResponse } from '@/lib/validation'

import { env } from '@/env'

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
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'account_balance',
				account: walletAddress,
			}),
			cache: 'no-store',
		})

		if (response.ok) {
			const data = await response.json()
			const validation = validateNanoBalanceResponse(data)
			if (validation.success && validation.balance) {
				return rawToXno(validation.balance)
			}
		}
	} catch (error) {
		console.error(`ENDPOINT: ${endpoint} - Failed to fetch balance for ${walletAddress}:`, error)
	}

	return 0
}
function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) {
		return forwarded.split(',')[0].trim()
	}
	const realIP = request.headers.get('x-real-ip')
	if (realIP) {
		return realIP
	}
	return 'unknown'
}

function isValidOrigin(request: NextRequest): boolean {
	const origin = request.headers.get('origin')
	const referer = request.headers.get('referer')

	if (!origin && !referer) {
		const secFetchSite = request.headers.get('sec-fetch-site')
		return !secFetchSite || secFetchSite === 'same-origin'
	}

	return isAllowedOrigin(origin, referer)
}

export async function GET(request: NextRequest): Promise<NextResponse<DonationBalanceResponse | { error: string }>> {
	const baseHeaders = {
		...getSecurityHeaders(),
		'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
	}

	if (!isValidOrigin(request)) {
		return NextResponse.json(
			{ error: 'Forbidden' },
			{
				status: 403,
				headers: baseHeaders,
			},
		)
	}

	const clientIP = getClientIP(request)
	const rateLimitResult = checkRateLimit(clientIP)

	if (!rateLimitResult.success) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{
				status: 429,
				headers: {
					...baseHeaders,
					...getRateLimitHeaders(rateLimitResult),
					'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
				},
			},
		)
	}

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
			...baseHeaders,
			...getRateLimitHeaders(rateLimitResult),
		},
	})
}
