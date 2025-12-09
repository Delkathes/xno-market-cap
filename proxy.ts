import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(_request: NextRequest) {
	const response = NextResponse.next()

	// HSTS - enforce HTTPS for 1 year
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

	// Prevent MIME sniffing
	response.headers.set('X-Content-Type-Options', 'nosniff')

	// Prevent clickjacking
	response.headers.set('X-Frame-Options', 'DENY')

	// Referrer policy
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

	// Isolate browsing context (Spectre mitigation)
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

	// Permissions Policy - disable unused browser features
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()',
	)

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all paths except static assets
		 */
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
	],
}
