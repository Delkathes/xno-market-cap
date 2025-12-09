/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	typedRoutes: true,

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

	experimental: {
		cssChunking: true,
		useLightningcss: true, // still testing
		// inlineCss: true,

		viewTransition: true,

		caseSensitiveRoutes: true,

		serverMinification: true,

		// serverComponentsHmrCache: true,

		optimisticClientCache: true,
		// optimizeCss: true,

		typedEnv: true,

		// serverActions: true,
		useCache: true,
		// cacheComponents: true,

		optimizePackageImports: [
			'react-hook-form',
			'@hookform/resolvers',
			'valibot',

			'@radix-ui/*',
			'tailwind-merge',
			'geist',

			'@tanstack/react-query',

			'jotai',

			'qrcode.react'
		],
	},

    headers: async () => [
        {
            // Apply to all static assets not covered by proxy.ts
            source: '/:path*',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            ],
        },
    ],
}

export default nextConfig
