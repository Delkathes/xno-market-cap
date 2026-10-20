import { createEnv } from '@t3-oss/env-nextjs'
import { netlify, vercel } from '@t3-oss/env-nextjs/presets-valibot'
import * as v from 'valibot'

enum NodeEnv {
	development = 'development',
	production = 'production',
	test = 'test',
}

function normalizeSiteUrl(value: string | undefined): string {
	const fallback = 'http://localhost:3000'
	try {
		const url = new URL(value ?? fallback)
		if (url.hostname === 'nanomarketcap.com') {
			url.hostname = 'www.nanomarketcap.com'
		}
		return url.origin
	} catch {
		return fallback
	}
}

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

export const env = createEnv({
	extends: [/* authEnv(), */ vercel(), netlify()],
	shared: {
		NODE_ENV: v.enum(NodeEnv, NodeEnv.development),
	},

	server: {
		// CoinGecko API
		COINGECKO_API_KEY: v.string(),
		// Nanswap API
		NANSWAP_API_KEY: v.string(),
	},

	client: {
		// Site
		NEXT_PUBLIC_SITE_URL: v.pipe(v.string(), v.url()),

		// Donation
		NEXT_PUBLIC_DONATION_WALLET_FINAL: v.string(),
		NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT: v.string(),
		NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE: v.string(),
		NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE: v.string(),
	},
	/**
	 * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
	 */
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,

		// Site
		NEXT_PUBLIC_SITE_URL: siteUrl,

		// Donation
		NEXT_PUBLIC_DONATION_WALLET_FINAL: process.env.NEXT_PUBLIC_DONATION_WALLET_FINAL,
		NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT: process.env.NEXT_PUBLIC_DONATION_WALLET_DEVELOPMENT,
		NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE: process.env.NEXT_PUBLIC_DONATION_WALLET_MAINTENANCE,
		NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE: process.env.NEXT_PUBLIC_DONATION_WALLET_OPENSOURCE,
	},

	skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
