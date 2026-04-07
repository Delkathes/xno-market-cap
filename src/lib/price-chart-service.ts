import * as v from 'valibot'

import { getCoingeckoClient } from '@/lib/coingecko'
import { CRYPTO_IDS } from '@/lib/constants'
import { RateLimitError, UpstreamError, ValidationError } from '@/lib/market-data-service'
import type { ChartTimeRange, PriceChartPoint, PriceChartResponse } from '@/lib/types'
import { ChartTimeRangeSchema } from '@/lib/validation'

async function fetchCoinChart(
	coinId: string,
	days: ChartTimeRange,
	vsCurrency: string = 'usd',
): Promise<{ prices: number[][]; market_caps: number[][]; total_volumes: number[][] }> {
	const client = getCoingeckoClient()

	try {
		const response = await client.coins.marketChart.get(coinId, {
			vs_currency: vsCurrency,
			days: String(days),
		})

		return {
			prices: response.prices ?? [],
			market_caps: response.market_caps ?? [],
			total_volumes: response.total_volumes ?? [],
		}
	} catch (error) {
		if (error instanceof Error) {
			// Handle SDK error types
			if (error.name === 'RateLimitError' || error.message.includes('429')) {
				throw new RateLimitError('CoinGecko API rate limit exceeded')
			}
			if (error.name === 'NotFoundError' || error.message.includes('404')) {
				throw new ValidationError(`Coin not found: ${coinId}`)
			}
			if (error.name === 'APIConnectionTimeoutError') {
				throw new UpstreamError(`Request timeout fetching ${coinId} chart data`)
			}
		}
		throw new UpstreamError(`Failed to fetch ${coinId} chart data`)
	}
}

/**
 * Find the closest XNO price for a given timestamp using binary search
 * Returns null if no XNO prices available (caller should handle this case)
 */
function findClosestXnoPrice(timestamp: number, xnoPrices: number[][]): number | null {
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

/**
 * Find the closest index in a timestamped array for a given timestamp using binary search
 */
function findClosestIndex(timestamp: number, data: number[][]): number {
	if (data.length === 0) return -1

	let left = 0
	let right = data.length - 1

	while (left < right) {
		const mid = Math.floor((left + right) / 2)
		if (data[mid][0] < timestamp) {
			left = mid + 1
		} else {
			right = mid
		}
	}

	// Check if the previous element is closer
	if (left > 0) {
		const prevDiff = Math.abs(data[left - 1][0] - timestamp)
		const currDiff = Math.abs(data[left][0] - timestamp)
		if (prevDiff < currDiff) {
			return left - 1
		}
	}

	return left
}

export async function getPriceChart(
	coinId: string,
	days: ChartTimeRange,
	vsCurrency?: string,
): Promise<PriceChartResponse> {
	// Validate inputs
	const daysResult = v.safeParse(ChartTimeRangeSchema, days)
	if (!daysResult.success) {
		throw new ValidationError('Invalid time range')
	}

	// Sanitize coinId - only allow alphanumeric and hyphens
	if (!/^[a-z0-9-]+$/.test(coinId)) {
		throw new ValidationError('Invalid coin ID')
	}

	// If requesting XNO itself
	if (coinId === CRYPTO_IDS.NANO) {
		// If vsCurrency is specified, fetch XNO price in that fiat currency
		const currency = vsCurrency ?? 'usd'
		const coinData = await fetchCoinChart(coinId, days, currency)

		const chartPoints: PriceChartPoint[] = coinData.prices.map(([timestamp, price], index) => {
			const marketCap = coinData.market_caps[index]?.[1] ?? 0
			const volume = coinData.total_volumes[index]?.[1] ?? 0
			// For XNO, marketCapInXNO is marketCap/price (= circulating supply essentially)
			const xnoPrice = vsCurrency ? price : 1
			return {
				timestamp,
				price, // This is now in the requested fiat currency
				// For XNO vs fiat, priceInXNO represents the fiat price (reusing the field)
				priceInXNO: xnoPrice,
				marketCap,
				volume,
				marketCapInXNO: xnoPrice > 0 ? marketCap / xnoPrice : 0,
				volumeInXNO: xnoPrice > 0 ? volume / xnoPrice : 0,
				// Not applicable for XNO itself
				xnoMarketCapInCoin: 0,
				xnoVolumeInCoin: 0,
			}
		})

		return {
			coinId,
			prices: chartPoints,
			timeRange: days,
			...(vsCurrency && { vsCurrency: vsCurrency as import('./types').FiatCurrencyCode }),
		}
	}

	// Fetch both coin data and XNO data in parallel for accurate historical conversion
	const [coinData, xnoData] = await Promise.all([fetchCoinChart(coinId, days), fetchCoinChart(CRYPTO_IDS.NANO, days)])

	// Transform raw data, using historical XNO prices for each timestamp
	const chartPoints: PriceChartPoint[] = coinData.prices
		.map(([timestamp, price], index) => {
			const xnoPrice = findClosestXnoPrice(timestamp, xnoData.prices)
			if (xnoPrice === null || xnoPrice <= 0) return null // Skip invalid points

			const marketCap = coinData.market_caps[index]?.[1] ?? 0
			const volume = coinData.total_volumes[index]?.[1] ?? 0

			// Find XNO's market cap and volume at the closest timestamp
			const xnoIndex = findClosestIndex(timestamp, xnoData.prices)
			const xnoMarketCap = xnoIndex >= 0 ? (xnoData.market_caps[xnoIndex]?.[1] ?? 0) : 0
			const xnoVolume = xnoIndex >= 0 ? (xnoData.total_volumes[xnoIndex]?.[1] ?? 0) : 0

			return {
				timestamp,
				price,
				priceInXNO: price / xnoPrice,
				marketCap,
				volume,
				marketCapInXNO: marketCap / xnoPrice,
				volumeInXNO: volume / xnoPrice,
				// XNO's values in terms of this coin
				xnoMarketCapInCoin: price > 0 ? xnoMarketCap / price : 0,
				xnoVolumeInCoin: price > 0 ? xnoVolume / price : 0,
			}
		})
		.filter((point): point is PriceChartPoint => point !== null)

	return {
		coinId,
		prices: chartPoints,
		timeRange: days,
	}
}
