import { type NextRequest, NextResponse } from 'next/server'

import { getMarketData, RateLimitError, UpstreamError, ValidationError } from '@/lib/market-data-service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getSecurityHeaders } from '@/lib/security-headers'

export const revalidate = 60

function getClientIP(request: NextRequest): string {
	// Check common headers for proxied requests
	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) {
		return forwarded.split(',')[0].trim()
	}
	const realIP = request.headers.get('x-real-ip')
	if (realIP) {
		return realIP
	}
	// Fallback
	return 'unknown'
}

function isValidOrigin(request: NextRequest): boolean {
	const origin = request.headers.get('origin')
	const referer = request.headers.get('referer')

	// Allow same-origin requests (no origin header)
	if (!origin && !referer) {
		return true
	}

	// Get allowed hosts from environment or use defaults
	const allowedHosts = [
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
		'http://localhost:3000',
		'https://localhost:3000',
	].filter(Boolean) as string[]

	// Check origin
	if (origin && allowedHosts.some((host) => origin.startsWith(host))) {
		return true
	}

	// Check referer as fallback
	if (referer && allowedHosts.some((host) => referer.startsWith(host))) {
		return true
	}

	return false
}

export async function GET(request: NextRequest) {
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

	try {
		const data = await getMarketData()
		return NextResponse.json(data, {
			headers: {
				...baseHeaders,
				...getRateLimitHeaders(rateLimitResult),
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
						...getRateLimitHeaders(rateLimitResult),
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
						...getRateLimitHeaders(rateLimitResult),
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
						...getRateLimitHeaders(rateLimitResult),
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
					...getRateLimitHeaders(rateLimitResult),
				},
			},
		)
	}
}
