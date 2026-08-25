import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	`script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ''}`,
	"style-src 'self' 'unsafe-inline' https://vercel.live",
	"img-src 'self' data: blob: https://assets.coingecko.com https://coin-images.coingecko.com https://nanswap.com https://bucket.nanwallet.com https://vercel.live https://vercel.com",
	"font-src 'self' data: https://vercel.live https://assets.vercel.com",
	"connect-src 'self' https: wss://ws.nano.to wss://nanoslo.0x.no wss://node.somenano.com wss://rainstorm.city wss://ws-us3.pusher.com",
	"frame-src https://nanswap.com https://vercel.live",
	"worker-src 'self' blob:",
	'upgrade-insecure-requests',
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	typedRoutes: true,

	// Enable MDX file extensions
	pageExtensions: ['md', 'mdx', 'ts', 'tsx'],

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'assets.coingecko.com',
				pathname: '/coins/images/**',
			},
			{
				protocol: 'https',
				hostname: 'coin-images.coingecko.com',
				pathname: '/coins/images/**',
			},
			{
				protocol: 'https',
				hostname: 'nanswap.com',
				pathname: '/logo/**',
			},
			{
				protocol: 'https',
				hostname: 'bucket.nanwallet.com',
				pathname: '/logo/**',
			},
		],
	},

	reactCompiler: true,
	cacheComponents: true,

	turbopack: {
		root: process.cwd(),
	},

	experimental: {
		// CSS
		cssChunking: true,
		useLightningcss: true,
		inlineCss: true,

		// Build correctness
		caseSensitiveRoutes: true,
		typedEnv: true,

		// Performance - server
		serverMinification: true,

		// Performance - client
		optimisticClientCache: true,
		optimisticRouting: true,

		// Performance - Turbopack (used for both dev and build)
		// turbopackRemoveUnusedImports: true,
		// turbopackRemoveUnusedExports: true,
	},

	headers: async () => [
		{
			source: '/:path*',
			headers: [
				// Security headers
				{ key: 'Content-Security-Policy', value: contentSecurityPolicy },
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
				{ key: 'X-Frame-Options', value: 'DENY' },
				{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
				{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
				{
					key: 'Permissions-Policy',
					value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()',
				},
				// HSTS - only set in production
				{
					key: 'Strict-Transport-Security',
					value: 'max-age=31536000; includeSubDomains; preload',
				},
				{ key: 'X-DNS-Prefetch-Control', value: 'off' },
			],
		},
		// Restrict cross-origin resource access for API routes only
		{
			source: '/api/:path*',
			headers: [
				{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
			],
		},
	],
}

const withMDX = createMDX({
	// Add markdown plugins here if needed
})

// Combine MDX and Next-Intl config
export default withMDX(withNextIntl(nextConfig))
