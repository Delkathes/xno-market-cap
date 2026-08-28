import { type NextRequest, NextResponse } from 'next/server'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { getDecentralizationData } from '@/lib/decentralization-service'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { isValidNanoAddress, rawToXno } from '@/lib/nano-utils'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'
import { NanoAccountInfoSchema, NanoBalanceSchema, NanoWeightSchema } from '@/lib/validation'

const PRINCIPAL_THRESHOLD = 0.001

// Round-robin index for fair RPC endpoint rotation
let rpcEndpointIndex = 0

function getNextRpcEndpoint(): string {
	const endpoint = RPC_ENDPOINTS[rpcEndpointIndex]
	rpcEndpointIndex = (rpcEndpointIndex + 1) % RPC_ENDPOINTS.length
	return endpoint
}

async function rpcCall(endpoint: string, action: string, account: string, extra: Record<string, unknown> = {}): Promise<unknown> {
	const response = await fetchWithTimeout(
		endpoint,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action, account, ...extra }),
		},
		8000,
	)
	if (!response.ok) {
		throw new Error(`RPC HTTP ${response.status}`)
	}
	return (await response.json()) as unknown
}

interface AccountInfoResponse {
	address: string
	balanceXno: number
	pendingXno: number
	representative: string
	frontier: string
	openBlock: string
	weightXno: number
	onlineWeightXno: number
	shareOfOnline: number
	principal: boolean
	rank: number | null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const baseHeaders = {
		...getSecurityHeaders(),
		'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
	}

	if (!isAllowedApiRequest(request)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: baseHeaders })
	}

	const clientIP = getClientIdentifier(request)
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

	const address = request.nextUrl.searchParams.get('address')?.trim() ?? ''
	if (!isValidNanoAddress(address)) {
		return NextResponse.json({ error: 'Invalid address' }, { status: 400, headers: baseHeaders })
	}

	let balanceXno = 0
	let pendingXno = 0
	let representative = ''
	let frontier = ''
	let openBlock = ''
	let weightXno = 0
	let rpcFailed = false
	let notFound = false

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = getNextRpcEndpoint()
		try {
			const [balanceJson, infoJson, weightJson] = await Promise.all([
				rpcCall(endpoint, 'account_balance', address),
				rpcCall(endpoint, 'account_info', address, { representative: true }),
				rpcCall(endpoint, 'account_weight', address),
			])

			if (
				typeof balanceJson === 'object' &&
				balanceJson !== null &&
				'error' in balanceJson &&
				typeof (balanceJson as { error: unknown }).error === 'string'
			) {
				notFound = true
				break
			}

			const balance = v.safeParse(NanoBalanceSchema, balanceJson)
			const info = v.safeParse(NanoAccountInfoSchema, infoJson)
			const weight = v.safeParse(NanoWeightSchema, weightJson)

			if (!balance.success || !info.success || !weight.success) {
				// Endpoint returned an unexpected shape; try the next relay.
				continue
			}

			balanceXno = rawToXno(balance.output.balance)
			pendingXno = rawToXno(balance.output.pending)
			representative = info.output.representative
			frontier = info.output.frontier
			openBlock = info.output.open_block
			weightXno = rawToXno(weight.output.weight)
			break
		} catch (error) {
			console.error(`ENDPOINT: ${endpoint} - Account info failed:`, error)
		}
	}

	if (notFound) {
		return NextResponse.json(
			{ error: 'Account not found' },
			{ status: 404, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
		)
	}

	if (balanceXno === 0 && pendingXno === 0 && weightXno === 0 && representative === '') {
		rpcFailed = true
	}

	if (rpcFailed) {
		return NextResponse.json(
			{ error: 'RPC unavailable' },
			{ status: 503, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
		)
	}

	// Voting weight context from the (cached) decentralization snapshot.
	let onlineWeightXno = 0
	let shareOfOnline = 0
	let principal = false
	let rank: number | null = null
	try {
		const dec = await getDecentralizationData()
		onlineWeightXno = dec.onlineWeightXno
		shareOfOnline = onlineWeightXno > 0 ? weightXno / onlineWeightXno : 0
		principal = shareOfOnline >= PRINCIPAL_THRESHOLD
		const rankIndex = dec.topReps.findIndex((rep) => rep.address === address)
		rank = rankIndex >= 0 ? rankIndex + 1 : null
	} catch (error) {
		console.error('Failed to load decentralization context:', error)
	}

	const response: AccountInfoResponse = {
		address,
		balanceXno,
		pendingXno,
		representative,
		frontier,
		openBlock,
		weightXno,
		onlineWeightXno,
		shareOfOnline,
		principal,
		rank,
	}

	return NextResponse.json(response, {
		headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) },
	})
}
