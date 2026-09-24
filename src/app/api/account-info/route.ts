import { type NextRequest, NextResponse } from 'next/server'

import { getAccountData } from '@/lib/account-data-service'
import { isValidNanoAddress } from '@/lib/nano-utils'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest): Promise<NextResponse> {
	const baseHeaders = getSecurityHeaders()
	// Only 200s are cacheable: a cached 403/429/5xx would pin a failure at
	// the edge for a minute, per URL variant.
	const cacheableHeaders = {
		...baseHeaders,
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

	const result = await getAccountData(address)

	if (!result.ok) {
		if (result.reason === 'notFound') {
			return NextResponse.json(
				{ error: 'Account not found' },
				{ status: 404, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
			)
		}

		return NextResponse.json(
			{ error: 'RPC unavailable' },
			{ status: 503, headers: { ...baseHeaders, ...getRateLimitHeaders(rateLimitResult) } },
		)
	}

	return NextResponse.json(result.data, {
		headers: { ...cacheableHeaders, ...getRateLimitHeaders(rateLimitResult) },
	})
}
