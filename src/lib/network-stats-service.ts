import { cacheLife } from 'next/cache'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { getDecentralizationData } from '@/lib/decentralization-service'
import { isTimeoutError } from '@/lib/fetch-with-timeout'
import { isErrorJson, nextRpcEndpoint, rpcCall } from '@/lib/rpc'

const BlockCountSchema = v.object({
	count: v.string(),
	cemented: v.string(),
	unchecked: v.string(),
})

export interface NetworkStats {
	totalBlocks: number
	cementedBlocks: number
	uncheckedBlocks: number
	onlineWeightXno: number
	principalReps: number
	/** Fraction of online weight held by principal reps (0-1). */
	principalShare: number
	fetchedAt: number
}

/**
 * Ledger-wide telemetry for the explorer hub: block counts from block_count
 * (supported on every relay), merged with the decentralization context
 * (online weight, principal reps). Cached 300s; the whole page re-renders on
 * the same cadence, so the strip tracks the network without hammering relays.
 */
export async function getNetworkStats(): Promise<NetworkStats | null> {
	'use cache'
	cacheLife({ revalidate: 300 })

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const json = await rpcCall(endpoint, 'block_count')
			if (isErrorJson(json)) {
				return null
			}
			const parsed = v.safeParse(BlockCountSchema, json)
			if (!parsed.success) {
				continue
			}

			const dec = await getDecentralizationData().catch(() => null)

			return {
				totalBlocks: Number(parsed.output.count),
				cementedBlocks: Number(parsed.output.cemented),
				uncheckedBlocks: Number(parsed.output.unchecked),
				onlineWeightXno: dec?.onlineWeightXno ?? 0,
				principalReps: dec?.principalReps ?? 0,
				principalShare: dec?.principalWeightShare ?? 0,
				fetchedAt: Date.now(),
			}
		} catch (error) {
			// Relay timeouts are expected in the failover loop; only unexpected
			// failures deserve a log line (and the dev error overlay).
			if (!isTimeoutError(error)) {
				console.error(`ENDPOINT: ${endpoint} - Network stats failed:`, error)
			}
		}
	}

	return null
}
