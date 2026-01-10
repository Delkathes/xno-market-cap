import * as v from 'valibot'

import { env } from '@/env'

import { CRYPTO_IDS } from './constants'
import { fetchWithRetry } from './fetch-with-timeout'
import type { CryptoData, MarketDataResponse, XnoPriceChangePerCurrency } from './types'
import { CryptoDataArraySchema, ExchangeRatesSchema, XnoCoinDetailSchema } from './validation'

// Custom error classes for specific failure scenarios
export class RateLimitError extends Error {
	constructor(message = 'CoinGecko API rate limit exceeded') {
		super(message)
		this.name = 'RateLimitError'
	}
}

export class ValidationError extends Error {
	constructor(message = 'Invalid API response structure') {
		super(message)
		this.name = 'ValidationError'
	}
}

export class UpstreamError extends Error {
	constructor(message = 'Failed to fetch data from upstream API') {
		super(message)
		this.name = 'UpstreamError'
	}
}

const REQUEST_TIMEOUT_MS = 10000

export async function getMarketData(): Promise<MarketDataResponse> {
	try {
		const apiKey = env.COINGECKO_API_KEY

		const headers: HeadersInit = {
			Accept: 'application/json',
			...(apiKey && { 'x-cg-demo-api-key': apiKey }),
		}

		const top25Response = await fetchWithRetry(
			'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h,24h,7d',
			{
				headers,
				next: {
					revalidate: 60,
				},
			} as RequestInit,
			{ timeoutMs: REQUEST_TIMEOUT_MS, retries: 3 },
		)

		if (!top25Response.ok) {
			if (top25Response.status === 429) {
				throw new RateLimitError('CoinGecko API rate limit exceeded')
			}
			throw new UpstreamError(`Failed to fetch top 25 cryptocurrencies: ${top25Response.status}`)
		}

		const top25Json = await top25Response.json()

		const top25Result = v.safeParse(CryptoDataArraySchema, top25Json)
		if (!top25Result.success) {
			console.error('Invalid API response structure for top 25:', top25Result.issues)
			throw new ValidationError('Invalid API response structure for top 25 cryptocurrencies')
		}

		const top25Data: CryptoData[] = top25Result.output.map((item) => ({
			...item,
			price_change_percentage_24h: item.price_change_percentage_24h ?? 0,
		}))

		// Check if XNO (Nano) is already in top 25
		const hasXNO = top25Data.some((crypto) => crypto.id === CRYPTO_IDS.NANO)

		const fetchPromises: Promise<Response | null>[] = []

		if (!hasXNO) {
			fetchPromises.push(
				fetchWithRetry(
					'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=nano&sparkline=false&price_change_percentage=1h,24h,7d',
					{
						headers,
						next: {
							revalidate: 60,
						},
					} as RequestInit,
					{ timeoutMs: REQUEST_TIMEOUT_MS, retries: 3 },
				),
			)
		} else {
			fetchPromises.push(Promise.resolve(null))
		}

		fetchPromises.push(
			fetchWithRetry(
				'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=eur,gbp,jpy,chf,cad,aud',
				{
					headers,
					next: {
						revalidate: 3600,
					},
				} as RequestInit,
				{ timeoutMs: REQUEST_TIMEOUT_MS, retries: 3 },
			),
		)

		// Fetch XNO coin detail for per-currency 1h, 24h, 7d price changes
		fetchPromises.push(
			fetchWithRetry(
				'https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false',
				{
					headers,
					next: {
						revalidate: 60,
					},
				} as RequestInit,
				{ timeoutMs: REQUEST_TIMEOUT_MS, retries: 3 },
			),
		)

		const [xnoResponse, ratesResponse, xnoDetailResponse] = await Promise.all(fetchPromises)

		let xnoData: CryptoData | null = null
		if (xnoResponse) {
			if (xnoResponse.ok) {
				const xnoJson = await xnoResponse.json()
				const xnoResult = v.safeParse(CryptoDataArraySchema, xnoJson)
				if (xnoResult.success && xnoResult.output[0]) {
					xnoData = {
						...xnoResult.output[0],
						price_change_percentage_24h: xnoResult.output[0].price_change_percentage_24h ?? 0,
					}
				}
			} else if (xnoResponse.status === 429) {
				throw new RateLimitError('CoinGecko API rate limit exceeded for XNO')
			}
		}

		if (xnoData === null) {
			throw new UpstreamError('Failed to fetch XNO data')
		}

		// Parse exchange rates - throw if we can't get valid rates
		if (!ratesResponse || !ratesResponse.ok) {
			if (ratesResponse?.status === 429) {
				throw new RateLimitError('CoinGecko API rate limit exceeded for exchange rates')
			}
			throw new UpstreamError('Failed to fetch exchange rates')
		}

		const ratesJson = await ratesResponse.json()
		const ratesResult = v.safeParse(ExchangeRatesSchema, ratesJson)
		if (!ratesResult.success || !ratesResult.output.usd) {
			throw new ValidationError('Invalid exchange rates response')
		}

		const {
			eur: eurRate,
			gbp: gbpRate,
			jpy: jpyRate,
			chf: chfRate,
			cad: cadRate,
			aud: audRate,
		} = ratesResult.output.usd
		if (
			eurRate === undefined ||
			gbpRate === undefined ||
			jpyRate === undefined ||
			chfRate === undefined ||
			cadRate === undefined ||
			audRate === undefined
		) {
			throw new ValidationError('Missing required exchange rates')
		}

		// Parse XNO detail for per-currency 1h, 24h, 7d changes
		const defaultPriceChange: XnoPriceChangePerCurrency = {
			usd: 0,
			eur: 0,
			gbp: 0,
			jpy: 0,
			chf: 0,
			cad: 0,
			aud: 0,
		}

		let xnoPriceChange1h: XnoPriceChangePerCurrency = { ...defaultPriceChange }
		let xnoPriceChange24h: XnoPriceChangePerCurrency = { ...defaultPriceChange }
		let xnoPriceChange7d: XnoPriceChangePerCurrency = { ...defaultPriceChange }

		if (xnoDetailResponse?.ok) {
			const xnoDetailJson = await xnoDetailResponse.json()
			const xnoDetailResult = v.safeParse(XnoCoinDetailSchema, xnoDetailJson)
			if (xnoDetailResult.success) {
				const marketData = xnoDetailResult.output.market_data

				const changes1h = marketData.price_change_percentage_1h_in_currency
				xnoPriceChange1h = {
					usd: changes1h.usd ?? 0,
					eur: changes1h.eur ?? 0,
					gbp: changes1h.gbp ?? 0,
					jpy: changes1h.jpy ?? 0,
					chf: changes1h.chf ?? 0,
					cad: changes1h.cad ?? 0,
					aud: changes1h.aud ?? 0,
				}

				const changes24h = marketData.price_change_percentage_24h_in_currency
				xnoPriceChange24h = {
					usd: changes24h.usd ?? 0,
					eur: changes24h.eur ?? 0,
					gbp: changes24h.gbp ?? 0,
					jpy: changes24h.jpy ?? 0,
					chf: changes24h.chf ?? 0,
					cad: changes24h.cad ?? 0,
					aud: changes24h.aud ?? 0,
				}

				const changes7d = marketData.price_change_percentage_7d_in_currency
				xnoPriceChange7d = {
					usd: changes7d.usd ?? 0,
					eur: changes7d.eur ?? 0,
					gbp: changes7d.gbp ?? 0,
					jpy: changes7d.jpy ?? 0,
					chf: changes7d.chf ?? 0,
					cad: changes7d.cad ?? 0,
					aud: changes7d.aud ?? 0,
				}
			} else {
				console.warn('Failed to parse XNO detail response for per-currency changes')
			}
		} else if (xnoDetailResponse?.status === 429) {
			console.warn('Rate limited when fetching XNO detail, using fallback')
		}

		// Combine data: top 25 + XNO if not already included
		const combinedData = hasXNO ? top25Data : [...top25Data, ...(xnoData ? [xnoData] : [])]

		// Sort by market cap rank
		combinedData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)

		return {
			data: combinedData,
			eurRate,
			gbpRate,
			jpyRate,
			chfRate,
			cadRate,
			audRate,
			xnoData,
			xnoPriceChange1h,
			xnoPriceChange24h,
			xnoPriceChange7d,
		}
	} catch (error) {
		// Re-throw custom errors as-is
		if (error instanceof RateLimitError || error instanceof ValidationError || error instanceof UpstreamError) {
			throw error
		}
		// Handle timeout errors
		if (error instanceof Error && error.name === 'AbortError') {
			throw new UpstreamError('Request timed out while fetching market data')
		}
		// Wrap unknown errors
		throw new UpstreamError(error instanceof Error ? error.message : 'Unknown error fetching market data')
	}
}
