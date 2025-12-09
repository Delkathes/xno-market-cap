/**
 * In-memory rate limiter with IP-based tracking
 * Limits requests per IP address within a sliding time window
 */

interface RateLimitEntry {
	count: number
	resetTime: number
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute per IP

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

let lastCleanup = Date.now()

function cleanupExpiredEntries() {
	const now = Date.now()
	if (now - lastCleanup < CLEANUP_INTERVAL_MS) return

	for (const [ip, entry] of rateLimitStore.entries()) {
		if (now > entry.resetTime) {
			rateLimitStore.delete(ip)
		}
	}
	lastCleanup = now
}

export interface RateLimitResult {
	success: boolean
	remaining: number
	resetTime: number
}

export function checkRateLimit(ip: string): RateLimitResult {
	cleanupExpiredEntries()

	const now = Date.now()
	const entry = rateLimitStore.get(ip)

	// First request or expired window
	if (!entry || now > entry.resetTime) {
		const resetTime = now + RATE_LIMIT_WINDOW_MS
		rateLimitStore.set(ip, { count: 1, resetTime })
		return {
			success: true,
			remaining: MAX_REQUESTS_PER_WINDOW - 1,
			resetTime,
		}
	}

	// Within window, check count
	if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
		return {
			success: false,
			remaining: 0,
			resetTime: entry.resetTime,
		}
	}

	// Increment count
	entry.count++
	return {
		success: true,
		remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
		resetTime: entry.resetTime,
	}
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
	return {
		'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
		'X-RateLimit-Remaining': result.remaining.toString(),
		'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
	}
}
