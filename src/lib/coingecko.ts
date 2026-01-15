import Coingecko from '@coingecko/coingecko-typescript'

import { env } from '@/env'

/**
 * Singleton CoinGecko client instance
 * Uses the Demo API with automatic retry handling
 */
let clientInstance: Coingecko | null = null

export function getCoingeckoClient(): Coingecko {
	if (!clientInstance) {
		clientInstance = new Coingecko({
			demoAPIKey: env.COINGECKO_API_KEY,
			environment: 'demo',
			maxRetries: 3,
			timeout: 10_000, // 10 seconds
		})
	}
	return clientInstance
}

/**
 * Reset the client instance (useful for testing or reconfiguration)
 */
export function resetCoingeckoClient(): void {
	clientInstance = null
}

// Re-export types that consumers might need
export type { Coingecko }
