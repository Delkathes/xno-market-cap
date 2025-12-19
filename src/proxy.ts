import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
	// Match all pathnames except for
	// - API routes
	// - Static files (e.g. /favicon.ico, /og-image.png)
	// - Next.js internals (_next)
	matcher: ['/', `/(en|nl|es|it|de|fr)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
