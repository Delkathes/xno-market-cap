import { RPC_ENDPOINTS } from '@/lib/constants'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

export const RPC_TIMEOUT_MS = 8000

// Round-robin cursor so concurrent renders don't all hit the same relay
let rpcEndpointCursor = 0

/** Picks the next relay endpoint, advancing the round-robin cursor. */
export function nextRpcEndpoint(): string {
	const endpoint = RPC_ENDPOINTS[rpcEndpointCursor % RPC_ENDPOINTS.length]
	rpcEndpointCursor = (rpcEndpointCursor + 1) % RPC_ENDPOINTS.length
	return endpoint
}

/** POSTs an RPC action to a relay and returns the parsed JSON. */
export async function rpcCall(endpoint: string, action: string, body: Record<string, unknown> = {}): Promise<unknown> {
	const response = await fetchWithTimeout(
		endpoint,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action, ...body }),
		},
		RPC_TIMEOUT_MS,
	)
	if (!response.ok) {
		throw new Error(`RPC HTTP ${response.status}`)
	}
	return (await response.json()) as unknown
}

/** Whether a relay response is an RPC error object ({"error": "..."}). */
export function isErrorJson(json: unknown): boolean {
	return (
		typeof json === 'object' &&
		json !== null &&
		'error' in json &&
		typeof (json as { error: unknown }).error === 'string'
	)
}
