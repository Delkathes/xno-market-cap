import * as v from 'valibot'

import { env } from '@/env'

import { CRYPTO_IDS } from './constants'
import { fetchWithRetry } from './fetch-with-timeout'
import { RateLimitError, UpstreamError, ValidationError } from './market-data-service'
import type { ChartTimeRange, PriceChartPoint, PriceChartResponse } from './types'
import { ChartTimeRangeSchema, PriceChartRawSchema } from './validation'

const REQUEST_TIMEOUT_MS = 10000

async function fetchCoinChart(
	coinId: string,
	days: ChartTimeRange,
	headers: HeadersInit,
): Promise<{ prices: [number, number][]; market_caps: [number, number][]; total_volumes: [number, number][] }> {
	const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`

	let response: Response
	try {
		response = await fetchWithRetry(
			url,
			{
				headers,
				next: {
					revalidate: days === '1' ? 300 : 900, // 5min for 1d, 15min for others
				},
			} as RequestInit,
			{ timeoutMs: REQUEST_TIMEOUT_MS, retries: 3 },
		)
	} catch (error) {
		// Handle timeout/abort errors
		if (error instanceof Error && error.name === 'AbortError') {
			throw new UpstreamError(`Request timeout fetching ${coinId} chart data`)
		}
		throw new UpstreamError(`Failed to fetch ${coinId} chart data after retries`)
	}

	if (!response.ok) {
		if (response.status === 429) {
			throw new RateLimitError('CoinGecko API rate limit exceeded')
		}
		if (response.status === 404) {
			throw new ValidationError(`Coin not found: ${coinId}`)
		}
		throw new UpstreamError(`Failed to fetch price chart: ${response.status}`)
	}

	const json = await response.json()

	const result = v.safeParse(PriceChartRawSchema, json)
	if (!result.success) {
		console.error('Invalid price chart response:', result.issues)
		throw new ValidationError('Invalid price chart response structure')
	}

	return result.output
}

/**
 * Find the closest XNO price for a given timestamp using binary search
 * Returns null if no XNO prices available (caller should handle this case)
 */
function findClosestXnoPrice(timestamp: number, xnoPrices: [number, number][]): number | null {
	if (xnoPrices.length === 0) return null

	let left = 0
	let right = xnoPrices.length - 1

	while (left < right) {
		const mid = Math.floor((left + right) / 2)
		if (xnoPrices[mid][0] < timestamp) {
			left = mid + 1
		} else {
			right = mid
		}
	}

	// Check if the previous element is closer
	if (left > 0) {
		const prevDiff = Math.abs(xnoPrices[left - 1][0] - timestamp)
		const currDiff = Math.abs(xnoPrices[left][0] - timestamp)
		if (prevDiff < currDiff) {
			return xnoPrices[left - 1][1]
		}
	}

	return xnoPrices[left][1]
}

export async function getPriceChart(coinId: string, days: ChartTimeRange): Promise<PriceChartResponse> {
	// Validate inputs
	const daysResult = v.safeParse(ChartTimeRangeSchema, days)
	if (!daysResult.success) {
		throw new ValidationError('Invalid time range')
	}

	// Sanitize coinId - only allow alphanumeric and hyphens
	if (!/^[a-z0-9-]+$/.test(coinId)) {
		throw new ValidationError('Invalid coin ID')
	}

	const apiKey = env.COINGECKO_API_KEY

	const headers: HeadersInit = {
		Accept: 'application/json',
		...(apiKey && { 'x-cg-demo-api-key': apiKey }),
	}

	// If requesting XNO itself, we only need one API call
	if (coinId === CRYPTO_IDS.NANO) {
		const coinData = await fetchCoinChart(coinId, days, headers)

		const chartPoints: PriceChartPoint[] = coinData.prices.map(([timestamp, price], index) => ({
			timestamp,
			price,
			priceInXNO: 1, // XNO is always 1 XNO
			marketCap: coinData.market_caps[index]?.[1] ?? 0,
			volume: coinData.total_volumes[index]?.[1] ?? 0,
		}))

		return {
			coinId,
			prices: chartPoints,
			timeRange: days,
		}
	}

	// Fetch both coin data and XNO data in parallel for accurate historical conversion
	const [coinData, xnoData] = await Promise.all([
		fetchCoinChart(coinId, days, headers),
		fetchCoinChart(CRYPTO_IDS.NANO, days, headers),
	])

	// Transform raw data, using historical XNO prices for each timestamp
	const chartPoints: PriceChartPoint[] = coinData.prices
		.map(([timestamp, price], index) => {
			const xnoPrice = findClosestXnoPrice(timestamp, xnoData.prices)
			if (xnoPrice === null || xnoPrice <= 0) return null // Skip invalid points

			return {
				timestamp,
				price,
				priceInXNO: price / xnoPrice,
				marketCap: coinData.market_caps[index]?.[1] ?? 0,
				volume: coinData.total_volumes[index]?.[1] ?? 0,
			}
		})
		.filter((point): point is PriceChartPoint => point !== null)

	return {
		coinId,
		prices: chartPoints,
		timeRange: days,
	}
}
