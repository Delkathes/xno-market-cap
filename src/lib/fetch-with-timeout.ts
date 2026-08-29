/**
 * Whether a fetch failure is a timeout/abort (the relay took too long and the
 * caller moved on). Expected in relay failover loops: logging them as errors
 * pollutes server logs and triggers Next's dev error overlay.
 */
export function isTimeoutError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		(error as { name: unknown }).name === 'AbortError'
	)
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		})
		return response
	} finally {
		clearTimeout(timeoutId)
	}
}

/**
 * Fetch with timeout and automatic retry with exponential backoff.
 * Does NOT retry on rate limit (429) or validation errors (4xx).
 */
export async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	{ timeoutMs = 10000, retries = 3, baseDelayMs = 1000 } = {},
): Promise<Response> {
	let lastError: Error | null = null

	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			const response = await fetchWithTimeout(url, options, timeoutMs)

			// Don't retry client errors (4xx) or rate limits (429)
			if (response.status === 429 || (response.status >= 400 && response.status < 500)) {
				return response
			}

			// Retry server errors (5xx)
			if (response.status >= 500) {
				lastError = new Error(`Server error: ${response.status}`)
				if (attempt < retries - 1) {
					await delay(baseDelayMs * 2 ** attempt)
					continue
				}
			}

			return response
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error))

			// Retry on network errors or timeouts
			if (attempt < retries - 1) {
				await delay(baseDelayMs * 2 ** attempt)
			}
		}
	}

	throw lastError ?? new Error('Fetch failed after retries')
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
