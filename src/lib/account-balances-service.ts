import { cacheLife } from 'next/cache'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { rawToXno } from '@/lib/nano-utils'
import { isErrorJson, nextRpcEndpoint, rpcCall } from '@/lib/rpc'
import { NanoBalanceSchema } from '@/lib/validation'

/**
 * Live balances for a set of accounts (one relay, parallel calls), used for
 * the popular-accounts placards on the explorer hub. Cached 300s; a failed
 * relay falls back to the next one, a failed account reads as 0 so the hub
 * never blocks on a dead endpoint.
 */
export async function getAccountBalances(addresses: string[]): Promise<Record<string, number>> {
	'use cache'
	cacheLife({ revalidate: 300 })

	if (addresses.length === 0) return {}

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = nextRpcEndpoint()

		try {
			const results = await Promise.all(
				addresses.map(async (address) => {
					try {
						const json = await rpcCall(endpoint, 'account_balance', { account: address })
						if (isErrorJson(json)) return { address, xno: 0 }
						const parsed = v.safeParse(NanoBalanceSchema, json)
						return { address, xno: parsed.success ? rawToXno(parsed.output.balance) : 0 }
					} catch {
						return { address, xno: 0 }
					}
				}),
			)
			return Object.fromEntries(results.map((result) => [result.address, result.xno]))
		} catch (error) {
			console.error(`ENDPOINT: ${endpoint} - Account balances failed:`, error)
		}
	}

	return Object.fromEntries(addresses.map((address) => [address, 0]))
}
