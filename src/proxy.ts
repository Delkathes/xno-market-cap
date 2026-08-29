import type { NextRequest, NextResponse as NextResponseType } from 'next/server'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import { isValidBlockHash, isValidNanoAddress } from './lib/nano-utils'

const LOCALE_PATTERN = /^(en|nl|es|it|de|fr)$/

// Malformed /account/{address} URLs get a real 307 from the proxy (PPR keeps
// prerendered shells at 200, so the route's own redirect can't change the
// status for non-browser clients). Valid addresses pass through untouched.
// Malformed addresses land on the explorer hub (which offers a search input).
function guardAccountPath(request: NextRequest): NextResponseType | null {
	const { pathname } = request.nextUrl
	const match = pathname.match(/^\/(?:(?:en|nl|es|it|de|fr)\/)?account\/([^/]+)$/)
	if (!match) return null

	const address = match[1]
	if (isValidNanoAddress(address)) return null

	const firstSegment = pathname.split('/')[1]
	const prefix = firstSegment && LOCALE_PATTERN.test(firstSegment) ? `/${firstSegment}` : ''
	return NextResponse.redirect(new URL(`${prefix}/explore`, request.url), 307)
}

// Malformed /block/{hash} URLs get a real 307 from the proxy for the same
// PPR reason; mixed-case hashes are canonicalized to lowercase to avoid
// duplicate URL space for indexing. Valid lowercase hashes pass through.
function guardBlockPath(request: NextRequest): NextResponseType | null {
	const { pathname } = request.nextUrl
	const match = pathname.match(/^\/(?:(?:en|nl|es|it|de|fr)\/)?block\/([^/]+)$/)
	if (!match) return null

	const hash = match[1]
	const firstSegment = pathname.split('/')[1]
	const prefix = firstSegment && LOCALE_PATTERN.test(firstSegment) ? `/${firstSegment}` : ''

	if (!isValidBlockHash(hash)) {
		return NextResponse.redirect(new URL(`${prefix}/explore`, request.url), 307)
	}
	if (hash !== hash.toLowerCase()) {
		return NextResponse.redirect(new URL(`${prefix}/block/${hash.toLowerCase()}`, request.url), 307)
	}
	return null
}

// AI/content crawlers stay ALLOWED (robots.txt permits them, so they remain
// discoverable and citable), but heavy ones are throttled to one request per
// window per path-group. They must back off on 429 + Retry-After (all major
// crawlers do); a runaway crawler can no longer burn the whole FOT quota.
// The bucket is per edge instance — a hard distributed cap would need a
// shared store (e.g. the Vercel Firewall), this is a best-effort ceiling.
const HEAVY_CRAWLER_AGENTS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'Bytespider',
	'ClaudeBot',
	'Claude-Web',
	'Claude-SearchBot',
	'PerplexityBot',
	'Amazonbot',
	'CCBot',
	'Meta-ExternalAgent',
	'cohere-ai',
	'omgili',
	'Diffbot',
	'ImagesiftBot',
]

const CRAWLER_WINDOW_MS = 60_000
const CRAWLER_MAX_REQUESTS_PER_WINDOW = 1

interface CrawlerBucket {
	count: number
	windowStart: number
}

const crawlerBuckets = new Map<string, CrawlerBucket>()

function throttleHeavyCrawlers(request: NextRequest): NextResponseType | null {
	const userAgent = request.headers.get('user-agent') ?? ''
	const agent = HEAVY_CRAWLER_AGENTS.find((name) => userAgent.includes(name))
	if (!agent) return null

	// Bucket per (agent, first path segment): /news, /en/news, /why-nano...
	// share the same budget; every other path-group gets its own.
	const firstSegment = request.nextUrl.pathname.split('/')[1] ?? ''
	const bucketKey = `${agent}:${firstSegment}`
	const now = Date.now()
	const bucket = crawlerBuckets.get(bucketKey)

	if (!bucket || now - bucket.windowStart >= CRAWLER_WINDOW_MS) {
		crawlerBuckets.set(bucketKey, { count: 1, windowStart: now })
		return null
	}

	bucket.count += 1
	if (bucket.count > CRAWLER_MAX_REQUESTS_PER_WINDOW) {
		const retryAfter = Math.ceil((bucket.windowStart + CRAWLER_WINDOW_MS - now) / 1000)
		return new NextResponse(null, {
			status: 429,
			headers: { 'Retry-After': String(Math.max(retryAfter, 1)) },
		})
	}
	return null
}

export default function proxy(request: NextRequest) {
	const guardedAccount = guardAccountPath(request)
	if (guardedAccount) return guardedAccount

	const guardedBlock = guardBlockPath(request)
	if (guardedBlock) return guardedBlock

	const throttled = throttleHeavyCrawlers(request)
	if (throttled) return throttled

	return createMiddleware(routing)(request)
}

export const config = {
	// Match all pathnames except for
	// - API routes
	// - Widget embeds (self-contained pages with an explicit locale segment;
	//   locale detection would rewrite their URLs)
	// - Static files (e.g. /favicon.ico, /og-image.png)
	// - Next.js internals (_next)
	matcher: ['/', `/(en|nl|es|it|de|fr)/((?!widgets/embed).*)`, '/((?!api|widgets/embed|_next|_vercel|.*\\..*).*)'],
}
