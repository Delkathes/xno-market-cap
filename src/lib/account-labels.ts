import { cacheLife } from 'next/cache'

import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { getKnownLabel } from '@/lib/known-accounts'

/**
 * Resolves a Nano.to username for an address. Cached for an hour per
 * address; never fails the page (returns null on any error).
 */
async function resolveNanoToUsername(address: string): Promise<string | null> {
	'use cache'
	cacheLife({ revalidate: 3600 })

	try {
		const response = await fetchWithTimeout(`https://api.nano.to/user/${address}`, {}, 5000)
		if (!response.ok) return null
		const text = await response.text()
		const trimmed = text.trim()
		if (!trimmed) return null
		try {
			const json: unknown = JSON.parse(trimmed)
			if (typeof json === 'object' && json !== null) {
				const record = json as Record<string, unknown>
				const name = record.name ?? record.username ?? record.title
				if (typeof name === 'string' && name.trim()) return name.trim()
			}
		} catch {
			// Non-JSON response: plain text name.
		}
		return trimmed.length <= 32 ? trimmed : null
	} catch {
		return null
	}
}

/** Known table first, then the Nano.to username fallback. */
export async function getAccountLabel(address: string): Promise<string | null> {
	const known = getKnownLabel(address)
	if (known) return known
	return resolveNanoToUsername(address)
}

/** Batch resolution for the addresses displayed on one page. */
export async function getAccountLabels(addresses: string[]): Promise<Record<string, string>> {
	const unique = [...new Set(addresses)].filter(Boolean).slice(0, 30)
	const knownOnly = unique.filter((address) => getKnownLabel(address))
	const toResolve = unique.filter((address) => !getKnownLabel(address))

	const [knownEntries, resolved] = await Promise.all([
		Promise.resolve(knownOnly.map((address) => [address, getKnownLabel(address) as string] as const)),
		Promise.all(
			toResolve.map((address) => resolveNanoToUsername(address).then((label) => [address, label] as const)),
		),
	])

	const labels: Record<string, string> = {}
	for (const [address, label] of [...knownEntries, ...resolved]) {
		if (label) labels[address] = label
	}
	return labels
}
