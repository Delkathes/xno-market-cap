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
// Deliberately absent: search-engine indexers (Googlebot, Bingbot,
// YandexBot, Baiduspider, PetalBot) and link-preview fetchers
// (facebookexternalhit, Twitterbot, Slackbot...). Both can send visitors,
// and throttling the latter breaks share previews. Their cost belongs to
// page caching, not to throttling.
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
	'AhrefsBot',
	'SemrushBot',
	'MJ12bot',
	'DotBot',
	'DataForSeoBot',
	'BLEXBot',
	'serpstatbot',
	'ZoominfoBot',
	'AI2Bot',
	'YouBot',
	'Timpibot',
	'Webzio-Extended',
	'PanguBot',
	'MistralAI-User',
	'GoogleOther',
]

// User agents are matched case-insensitively: Meta advertises itself as
// `meta-externalagent`, so a case-sensitive includes() silently never fires.
const HEAVY_CRAWLER_MATCHERS = HEAVY_CRAWLER_AGENTS.map((agent) => ({
	agent,
	pattern: agent.toLowerCase(),
}))

const CRAWLER_WINDOW_MS = 60_000
const CRAWLER_MAX_REQUESTS_PER_WINDOW = 30

interface CrawlerBucket {
	count: number
	windowStart: number
}

const crawlerBuckets = new Map<string, CrawlerBucket>()

function throttleHeavyCrawlers(request: NextRequest): NextResponseType | null {
	const userAgent = (request.headers.get('user-agent') ?? '').toLowerCase()
	const match = HEAVY_CRAWLER_MATCHERS.find(({ pattern }) => userAgent.includes(pattern))
	if (!match) return null
	const agent = match.agent

	const bucketKey = agent
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

function guardNewsPagination(request: NextRequest): NextResponseType | null {
	const { pathname, searchParams } = request.nextUrl
	if (!/^\/(?:(?:en|nl|es|it|de|fr)\/)?news$/.test(pathname)) return null
	const pageParam = searchParams.get('page')
	if (pageParam === null) return null
	const page = Number.parseInt(pageParam, 10)
	if (Number.isFinite(page) && page >= 1 && page <= 50) return null
	const url = request.nextUrl.clone()
	url.search = ''
	return NextResponse.redirect(url, 308)
}

function guardUppercasePath(request: NextRequest): NextResponseType | null {
	const { pathname } = request.nextUrl
	if (pathname === pathname.toLowerCase()) return null
	const url = request.nextUrl.clone()
	url.pathname = pathname.toLowerCase()
	return NextResponse.redirect(url, 308)
}

export default function proxy(request: NextRequest) {
	const guardedCase = guardUppercasePath(request)
	if (guardedCase) return guardedCase

	const guardedNews = guardNewsPagination(request)
	if (guardedNews) return guardedNews

	const guardedAccount = guardAccountPath(request)
	if (guardedAccount) return guardedAccount

	const guardedBlock = guardBlockPath(request)
	if (guardedBlock) return guardedBlock

	const throttled = throttleHeavyCrawlers(request)
	if (throttled) return throttled

	const response = createMiddleware(routing)(request)
	const localeCookie = response.cookies.get('NEXT_LOCALE')
	if (localeCookie) {
		response.cookies.set('NEXT_LOCALE', localeCookie.value, {
			path: '/',
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 365,
		})
	}
	if (response.status === 307 || response.status === 308) {
		response.headers.set('Vary', 'Accept-Language')
		response.headers.set('Cache-Control', 'private, no-store')
	}
	return response
}

export const config = {
	// Match all pathnames except for
	// - API routes
	// - Widget embeds (self-contained pages with an explicit locale segment;
	//   locale detection would rewrite their URLs)
	// - Static files (e.g. /favicon.ico, /og-image.jpg)
	// - Next.js internals (_next)
	matcher: ['/', `/(en|nl|es|it|de|fr)/((?!widgets/embed).*)`, '/((?!api|widgets/embed|_next|_vercel|.*\\..*).*)'],
}
