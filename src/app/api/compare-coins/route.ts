import { type NextRequest, NextResponse } from 'next/server'
import * as v from 'valibot'

import {
	COMPARE_COIN_LIMIT,
	COMPARE_COOKIE_MAX_AGE,
	COMPARE_COOKIE_NAME,
	filterToKnown,
	normalizeTickers,
} from '@/lib/compare-cookies'
import { getCompareRates } from '@/lib/market-data-service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter'
import { getClientIdentifier, isAllowedApiRequest } from '@/lib/request-security'
import { getSecurityHeaders } from '@/lib/security-headers'

const CompareTickersSchema = v.object({
	tickers: v.array(v.string()),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
	const baseHeaders = getSecurityHeaders()

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

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400, headers: baseHeaders })
	}

	const parsed = v.safeParse(CompareTickersSchema, body)
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid tickers' }, { status: 400, headers: baseHeaders })
	}

	const tickers = normalizeTickers(parsed.output.tickers)

	// Restrict to coins the site actually tracks.
	let known = new Set<string>()
	try {
		const rates = await getCompareRates()
		known = new Set(rates.coins.map((coin) => coin.symbol))
	} catch {
		// Unknown set: accept syntactically valid tickers as-is.
	}
	const clean = filterToKnown(tickers, known)

	const response = NextResponse.json({ ok: true, tickers: clean }, { headers: baseHeaders })
	response.cookies.set({
		name: COMPARE_COOKIE_NAME,
		value: JSON.stringify(clean),
		maxAge: COMPARE_COOKIE_MAX_AGE,
		path: '/',
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
	})

	return response
}
