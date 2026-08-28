import type { NextRequest, NextResponse as NextResponseType } from 'next/server'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import { isValidNanoAddress } from './lib/nano-utils'

const LOCALE_PATTERN = /^(en|nl|es|it|de|fr)$/

// Malformed /account/{address} URLs get a real 307 from the proxy (PPR keeps
// prerendered shells at 200, so the route's own redirect can't change the
// status for non-browser clients). Valid addresses pass through untouched.
function guardAccountPath(request: NextRequest): NextResponseType | null {
	const { pathname } = request.nextUrl
	const match = pathname.match(/^\/(?:(?:en|nl|es|it|de|fr)\/)?account\/([^/]+)$/)
	if (!match) return null

	const address = match[1]
	if (isValidNanoAddress(address)) return null

	const firstSegment = pathname.split('/')[1]
	const prefix = firstSegment && LOCALE_PATTERN.test(firstSegment) ? `/${firstSegment}` : ''
	return NextResponse.redirect(new URL(`${prefix}/tools/account-inspector`, request.url), 307)
}

export default function proxy(request: NextRequest) {
	const guarded = guardAccountPath(request)
	if (guarded) return guarded
	return createMiddleware(routing)(request)
}

export const config = {
	// Match all pathnames except for
	// - API routes
	// - Static files (e.g. /favicon.ico, /og-image.png)
	// - Next.js internals (_next)
	matcher: ['/', `/(en|nl|es|it|de|fr)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
