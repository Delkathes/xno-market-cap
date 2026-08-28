import { type NextRequest, NextResponse } from 'next/server'

import { getBlockInfo } from '@/lib/account-data-service'
import { isValidBlockHash } from '@/lib/nano-utils'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest): Promise<NextResponse> {
	const baseHeaders = {
		...getSecurityHeaders(),
		'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

	const hash = request.nextUrl.searchParams.get('hash')?.trim().toLowerCase() ?? ''
	if (!isValidBlockHash(hash)) {
		return NextResponse.json({ error: 'Invalid hash' }, { status: 400, headers: baseHeaders })
	}

	try {
		const info = await getBlockInfo(hash)
		if (!info) {
			return NextResponse.json(
				{ error: 'Block not found' },
				{ status: 404, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
			)
		}
		return NextResponse.json(info, {
			headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) },
		})
	} catch (error) {
		console.error('Block info failed:', error)
		return NextResponse.json(
			{ error: 'RPC unavailable' },
			{ status: 503, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
		)
	}
}
