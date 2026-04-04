import { env } from '@/env'

/**
 * Get all allowed origins for API requests
 * Includes configured site URL plus Netlify preview URLs
 */
export function getAllowedOrigins(): string[] {
	const origins: string[] = [
		// Always allow localhost for development
		...(env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
		...['https://dev--xnomarketcap.netlify.app', env.NEXT_PUBLIC_SITE_URL, 'https://xno-market-cap.vercel.app'],
	]

	// Add configured site URL
	if (env.NEXT_PUBLIC_SITE_URL) {
		origins.push(env.NEXT_PUBLIC_SITE_URL)
	}

	// Add NETLIFY URL if available
	if (env.URL) {
		origins.push(env.URL)
	}

	return origins.filter(Boolean)
}

/**
 * Check if a request origin/referer is allowed
 */
export function isAllowedOrigin(origin: string | null, referer: string | null): boolean {
	const allowedOrigins = getAllowedOrigins()

	// Check origin
	if (origin && allowedOrigins.some((host) => origin.startsWith(host))) {
		return true
	}

	// Check referer as fallback
	if (referer && allowedOrigins.some((host) => referer.startsWith(host))) {
		return true
	}

	return false
}
