import { cacheLife } from 'next/cache'
import * as v from 'valibot'

import { fetchWithRetry } from '@/lib/fetch-with-timeout'

const MempoolFeesSchema = v.object({
	fastestFee: v.number(),
	halfHourFee: v.number(),
	hourFee: v.number(),
	economyFee: v.number(),
})

export interface BtcFees {
	fastestFee: number
	halfHourFee: number
	hourFee: number
	economyFee: number
}

// Live Bitcoin fee estimates in sat/vB from mempool.space (free, no API key).
export async function getBtcFees(): Promise<BtcFees> {
	'use cache'
	cacheLife({ revalidate: 300 })

	const response = await fetchWithRetry(
		'https://mempool.space/api/v1/fees/recommended',
		{
			headers: { accept: 'application/json' },
			cache: 'no-store',
		},
		{ timeoutMs: 8000, retries: 2 },
	)

	if (!response.ok) {
		throw new Error(`mempool.space error: HTTP ${response.status}`)
	}

	const json: unknown = await response.json()
	const parsed = v.safeParse(MempoolFeesSchema, json)
	if (!parsed.success) {
		throw new Error('Invalid mempool.space response shape')
	}

	return parsed.output
}
