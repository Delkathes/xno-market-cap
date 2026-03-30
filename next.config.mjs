import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

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

	experimental: {
		// CSS
		cssChunking: true,
		useLightningcss: true,
		inlineCss: true,

		// UI
		viewTransition: true,

		// Build correctness
		caseSensitiveRoutes: true,
		typedEnv: true,

		// Performance - server
		serverMinification: true,
		parallelServerCompiles: true,

		// Performance - client
		optimisticClientCache: true,
		optimisticRouting: true,

		// Performance - Turbopack (used for both dev and build)
		// turbopackRemoveUnusedImports: true,
		// turbopackRemoveUnusedExports: true,

		// Caching
		useCache: true,
	},

	headers: async () => [
		{
			source: '/:path*',
			headers: [
				// Security headers
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
			],
		},
	],
}

const withMDX = createMDX({
	// Add markdown plugins here if needed
})

// Combine MDX and Next-Intl config
export default withMDX(withNextIntl(nextConfig))
