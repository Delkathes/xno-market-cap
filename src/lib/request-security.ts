import type { NextRequest } from 'next/server'

import { isAllowedOrigin } from '@/lib/allowed-hosts'

const INTERNAL_REQUEST_USER_AGENT_PATTERNS = [/node/i, /undici/i, /next\.js/i, /vercel/i, /netlify/i]

const TRUSTED_IP_HEADERS = [
	'x-vercel-forwarded-for',
	'x-nf-client-connection-ip',
	'cf-connecting-ip',
	'fly-client-ip',
	'x-real-ip',
] as const

function getTrimmedHeader(request: NextRequest, headerName: string): string | null {
	const value = request.headers.get(headerName)?.trim()
	return value ? value : null
}

export function getClientIdentifier(request: NextRequest): string {
	for (const headerName of TRUSTED_IP_HEADERS) {
		const trustedIp = getTrimmedHeader(request, headerName)
		if (trustedIp) {
			return trustedIp
		}
	}

	const forwardedFor = request.headers
		.get('x-forwarded-for')
		?.split(',')
		.map((value) => value.trim())
		.filter(Boolean)

	if (forwardedFor && forwardedFor.length > 0) {
		return forwardedFor[forwardedFor.length - 1]
	}

	const userAgent = request.headers.get('user-agent')?.slice(0, 120) ?? 'unknown-agent'
	const acceptLanguage = request.headers.get('accept-language')?.slice(0, 60) ?? 'unknown-language'

	return `unknown:${userAgent}:${acceptLanguage}`
}

export function isAllowedApiRequest(request: NextRequest): boolean {
	const origin = request.headers.get('origin')
	const referer = request.headers.get('referer')
	const host = request.headers.get('host')

	if (origin || referer) {
		return isAllowedOrigin(origin, referer, host)
	}

	const secFetchSite = request.headers.get('sec-fetch-site')
	if (secFetchSite === 'same-origin') {
		return true
	}

	const userAgent = request.headers.get('user-agent') ?? ''
	return INTERNAL_REQUEST_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent))
}
