import { env } from '@/env'

function normalizeOrigin(value: string): string | null {
	try {
		return new URL(value).origin
	} catch {
		return null
	}
}

/**
 * Get all allowed origins for API requests
 * Includes configured site URL plus Netlify preview URLs
 */
export function getAllowedOrigins(): string[] {
	const origins = [
		// Always allow localhost for development
		...(env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
		...['https://dev--xnomarketcap.netlify.app', env.NEXT_PUBLIC_SITE_URL, 'https://xno-market-cap.vercel.app'],
	]

	// Add NETLIFY URL if available
	if (env.URL) {
		origins.push(env.URL)
	}

	return [
		...new Set(
			origins.map((origin) => normalizeOrigin(origin)).filter((origin): origin is string => Boolean(origin)),
		),
	]
}

/**
 * Check if a request origin/referer is allowed
 */
export function isAllowedOrigin(origin: string | null, referer: string | null): boolean {
	const allowedOrigins = new Set(getAllowedOrigins())
	const normalizedOrigin = origin ? normalizeOrigin(origin) : null
	const normalizedReferer = referer ? normalizeOrigin(referer) : null

	// Check origin
	if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
		return true
	}

	// Check referer as fallback
	if (normalizedReferer && allowedOrigins.has(normalizedReferer)) {
		return true
	}

	return false
}
