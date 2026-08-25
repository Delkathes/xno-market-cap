import { type NextRequest, NextResponse } from 'next/server'

import { getMarketData, RateLimitError, UpstreamError, ValidationError } from '@/lib/market-data-service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'

import { env } from '@/env'

export async function GET(request: NextRequest) {
	const baseHeaders = {
		...getSecurityHeaders(),
		'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
	}

	if (!isAllowedApiRequest(request)) {
		return NextResponse.json(
			{ error: 'Forbidden' },
			{
				status: 403,
				headers: baseHeaders,
			},
		)
	}

	// Rate limiting only applies in production; dev is single-user and the
	// in-memory limiter would otherwise cause self-inflicted lockouts.
	const clientIP = getClientIdentifier(request)
	const rateLimitResult = env.NODE_ENV === 'production' ? checkRateLimit(clientIP) : null

	if (rateLimitResult && !rateLimitResult.success) {
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

	try {
		const data = await getMarketData()
		return NextResponse.json(data, {
			headers: {
				...baseHeaders,
				...(rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {}),
			},
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		console.error('Market data API error:', {
			type: error instanceof Error ? error.name : 'Unknown',
			message: errorMessage.substring(0, 100), // Truncate to prevent log flooding
			timestamp: new Date().toISOString(),
		})

		// Handle rate limit errors from upstream (CoinGecko)
		if (error instanceof RateLimitError) {
			return NextResponse.json(
				{ error: 'Upstream rate limit exceeded. Please try again later.', code: 'RATE_LIMIT' },
				{
					status: 503,
					headers: {
						...baseHeaders,
						...(rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {}),
						'Retry-After': '60',
					},
				},
			)
		}

		// Handle validation errors
		if (error instanceof ValidationError) {
			return NextResponse.json(
				{ error: 'Invalid data received from upstream API.', code: 'VALIDATION_ERROR' },
				{
					status: 502,
					headers: {
						...baseHeaders,
						...(rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {}),
					},
				},
			)
		}

		// Handle upstream errors (timeouts, connection issues, etc.)
		if (error instanceof UpstreamError) {
			return NextResponse.json(
				{ error: 'Unable to fetch market data. Please try again later.', code: 'UPSTREAM_ERROR' },
				{
					status: 502,
					headers: {
						...baseHeaders,
						...(rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {}),
					},
				},
			)
		}

		// Catch-all for unexpected errors
		return NextResponse.json(
			{ error: 'Failed to fetch market data', code: 'UNKNOWN_ERROR' },
			{
				status: 500,
				headers: {
					...baseHeaders,
					...(rateLimitResult ? getRateLimitHeaders(rateLimitResult) : {}),
				},
			},
		)
	}
}
