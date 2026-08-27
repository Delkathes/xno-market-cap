import { cacheLife } from 'next/cache'
import * as v from 'valibot'

import { RPC_ENDPOINTS } from '@/lib/constants'
import { fetchWithRetry } from '@/lib/fetch-with-timeout'
import { rawToXno } from '@/lib/nano-utils'

const RepWeightSchema = v.object({
	weight: v.string(),
})

const RepresentativesOnlineSchema = v.object({
	representatives: v.record(v.string(), RepWeightSchema),
})

export interface RepWeightEntry {
	address: string
	weightXno: number
	share: number
}

export interface DecentralizationData {
	onlineWeightXno: number
	principalReps: number
	principalWeightShare: number
	top10Share: number
	gini: number
	repCount: number
	topReps: RepWeightEntry[]
	fetchedAt: number
}

const PRINCIPAL_THRESHOLD = 0.001
const TOP_REPS_LIMIT = 50

// Round-robin cursor so concurrent renderers don't all hit the same relay
let rpcEndpointCursor = 0

export async function getDecentralizationData(): Promise<DecentralizationData> {
	'use cache'
	cacheLife({ revalidate: 300 })

	const errors: string[] = []

	for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
		const endpoint = RPC_ENDPOINTS[(rpcEndpointCursor + attempt) % RPC_ENDPOINTS.length]
		rpcEndpointCursor = (rpcEndpointCursor + attempt + 1) % RPC_ENDPOINTS.length

		try {
			const response = await fetchWithRetry(
				endpoint,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'representatives_online', weight: true }),
				},
				{ timeoutMs: 8000, retries: 1 },
			)

			if (!response.ok) {
				errors.push(`${endpoint}: HTTP ${response.status}`)
				continue
			}

			const json: unknown = await response.json()
			const parsed = v.safeParse(RepresentativesOnlineSchema, json)
			if (!parsed.success) {
				errors.push(`${endpoint}: invalid response shape`)
				continue
			}

			return computeDecentralization(
				Object.entries(parsed.output.representatives).map(([address, rep]) => ({
					address,
					weight: rep.weight,
				})),
			)
		} catch (error) {
			errors.push(`${endpoint}: ${error instanceof Error ? error.message : 'unknown error'}`)
		}
	}

	throw new Error(`All Nano RPC endpoints failed. ${errors.join('; ')}`)
}

function computeDecentralization(reps: Array<{ address: string; weight: string }>): DecentralizationData {
	const entries = reps
		.map((rep) => ({ address: rep.address, weightXno: rawToXno(rep.weight) }))
		.filter((rep) => rep.weightXno > 0)
		.sort((a, b) => b.weightXno - a.weightXno)

	const onlineWeightXno = entries.reduce((sum, rep) => sum + rep.weightXno, 0)
	if (onlineWeightXno <= 0) {
		return {
			onlineWeightXno: 0,
			principalReps: 0,
			principalWeightShare: 0,
			top10Share: 0,
			gini: 0,
			repCount: entries.length,
			topReps: [],
			fetchedAt: Date.now(),
		}
	}

	const principalThreshold = onlineWeightXno * PRINCIPAL_THRESHOLD
	const principals = entries.filter((rep) => rep.weightXno >= principalThreshold)
	const principalWeight = principals.reduce((sum, rep) => sum + rep.weightXno, 0)

	const top10Share = entries.slice(0, 10).reduce((sum, rep) => sum + rep.weightXno, 0) / onlineWeightXno

	const topReps = entries.slice(0, TOP_REPS_LIMIT).map((rep) => ({
		...rep,
		share: rep.weightXno / onlineWeightXno,
	}))

	return {
		onlineWeightXno,
		principalReps: principals.length,
		principalWeightShare: principalWeight / onlineWeightXno,
		top10Share,
		gini: computeGini(entries.map((rep) => rep.weightXno)),
		repCount: entries.length,
		topReps,
		fetchedAt: Date.now(),
	}
}

// Gini coefficient over the full online voting weight distribution.
// 0 = perfectly equal weight, 1 = a single voter controls everything.
function computeGini(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b)
	const n = sorted.length
	if (n === 0) return 0

	let cumulative = 0
	let weightedSum = 0
	for (let i = 0; i < n; i++) {
		cumulative += sorted[i]
		weightedSum += (i + 1) * sorted[i]
	}

	if (cumulative <= 0) return 0

	const gini = (2 * weightedSum) / (n * cumulative) - (n + 1) / n
	return Math.max(0, Math.min(1, gini))
}
