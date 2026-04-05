import { type NextRequest, NextResponse } from 'next/server'

import { RateLimitError, UpstreamError, ValidationError } from '@/lib/market-data-service'
import { getPriceChart } from '@/lib/price-chart-service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'
import type { ChartTimeRange } from '@/lib/types'

type RouteParams = {
	params: Promise<{
		coinId: string
		days: string
		vsCurrency?: string[]
	}>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	const { coinId, days, vsCurrency: vsCurrencyArr } = await params
	const vsCurrency = vsCurrencyArr?.[0] // Optional catch-all gives array

	const baseHeaders = {
		...getSecurityHeaders(),
		'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

	// Route-level validation - fail fast before calling service
	const VALID_TIME_RANGES = ['1', '7', '30', '90', '365']
	const COIN_ID_PATTERN = /^[a-z0-9-]+$/
	const VALID_FIAT_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'chf', 'cad', 'aud']

	if (!COIN_ID_PATTERN.test(coinId)) {
		return NextResponse.json(
			{ error: 'Invalid coin ID format', code: 'VALIDATION_ERROR' },
			{
				status: 400,
				headers: baseHeaders,
			},
		)
	}

	if (!VALID_TIME_RANGES.includes(days)) {
		return NextResponse.json(
			{ error: 'Invalid time range. Must be one of: 1, 7, 30, 90, 365', code: 'VALIDATION_ERROR' },
			{
				status: 400,
				headers: baseHeaders,
			},
		)
	}

	// Validate vsCurrency if provided (only valid for XNO)
	if (vsCurrency) {
		if (!VALID_FIAT_CURRENCIES.includes(vsCurrency)) {
			return NextResponse.json(
				{
					error: 'Invalid currency. Must be one of: usd, eur, gbp, jpy, chf, cad, aud',
					code: 'VALIDATION_ERROR',
				},
				{
					status: 400,
					headers: baseHeaders,
				},
			)
		}
		if (coinId !== 'nano') {
			return NextResponse.json(
				{ error: 'vsCurrency parameter is only valid for XNO (nano) charts', code: 'VALIDATION_ERROR' },
				{
					status: 400,
					headers: baseHeaders,
				},
			)
		}
	}

	try {
		const data = await getPriceChart(coinId, days as ChartTimeRange, vsCurrency ?? undefined)
		return NextResponse.json(data, {
			headers: {
				...baseHeaders,
				...getRateLimitHeaders(rateLimitResult),
			},
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		console.error('Price chart API error:', {
			type: error instanceof Error ? error.name : 'Unknown',
			message: errorMessage.substring(0, 100),
			coinId,
			days,
			timestamp: new Date().toISOString(),
		})

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

		if (error instanceof ValidationError) {
			return NextResponse.json(
				{ error: error.message, code: 'VALIDATION_ERROR' },
				{
					status: 400,
					headers: {
						...baseHeaders,
						...getRateLimitHeaders(rateLimitResult),
					},
				},
			)
		}

		if (error instanceof UpstreamError) {
			return NextResponse.json(
				{ error: 'Unable to fetch price chart. Please try again later.', code: 'UPSTREAM_ERROR' },
				{
					status: 502,
					headers: {
						...baseHeaders,
						...getRateLimitHeaders(rateLimitResult),
					},
				},
			)
		}

		return NextResponse.json(
			{ error: 'Failed to fetch price chart', code: 'UNKNOWN_ERROR' },
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
