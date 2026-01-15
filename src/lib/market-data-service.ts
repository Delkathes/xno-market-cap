import * as v from 'valibot'

import { getCoingeckoClient } from './coingecko'
import { CRYPTO_IDS } from './constants'
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

function mapSdkError(error: unknown, context: string): never {
	if (error instanceof Error) {
		if (error.name === 'RateLimitError' || error.message.includes('429')) {
			throw new RateLimitError(`CoinGecko API rate limit exceeded: ${context}`)
		}
		if (error.name === 'APIConnectionTimeoutError') {
			throw new UpstreamError(`Request timed out: ${context}`)
		}
	}
	throw new UpstreamError(`Failed to fetch data: ${context}`)
}

export async function getMarketData(): Promise<MarketDataResponse> {
	try {
		const client = getCoingeckoClient()

		// Fetch top 25 cryptocurrencies
		let top25Json: unknown
		try {
			top25Json = await client.coins.markets.get({
				vs_currency: 'usd',
				order: 'market_cap_desc',
				per_page: 25,
				page: 1,
				sparkline: false,
				price_change_percentage: '1h,24h,7d',
			})
		} catch (error) {
			mapSdkError(error, 'top 25 cryptocurrencies')
		}

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

		// Build parallel fetch promises
		const fetchXno = async (): Promise<CryptoData | null> => {
			if (hasXNO) return null
			try {
				const xnoJson = await client.coins.markets.get({
					vs_currency: 'usd',
					ids: 'nano',
					sparkline: false,
					price_change_percentage: '1h,24h,7d',
				})
				const xnoResult = v.safeParse(CryptoDataArraySchema, xnoJson)
				if (xnoResult.success && xnoResult.output[0]) {
					return {
						...xnoResult.output[0],
						price_change_percentage_24h: xnoResult.output[0].price_change_percentage_24h ?? 0,
					}
				}
				return null
			} catch (error) {
				mapSdkError(error, 'XNO data')
			}
		}

		const fetchRates = async () => {
			try {
				const ratesJson = await client.simple.price.get({
					ids: 'usd',
					vs_currencies: 'eur,gbp,jpy,chf,cad,aud',
				})
				return ratesJson
			} catch (error) {
				mapSdkError(error, 'exchange rates')
			}
		}

		const fetchXnoDetail = async () => {
			try {
				const xnoDetailJson = await client.coins.getID('nano', {
					localization: false,
					tickers: false,
					market_data: true,
					community_data: false,
					developer_data: false,
					sparkline: false,
				})
				return xnoDetailJson
			} catch (error) {
				// Non-critical: log warning and return null
				console.warn('Failed to fetch XNO detail:', error)
				return null
			}
		}

		const [xnoData, ratesJson, xnoDetailJson] = await Promise.all([fetchXno(), fetchRates(), fetchXnoDetail()])

		if (xnoData === null && !hasXNO) {
			throw new UpstreamError('Failed to fetch XNO data')
		}

		// Parse exchange rates
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

		if (xnoDetailJson) {
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
		}

		// Get XNO data from either fetched result or from top25
		const finalXnoData = xnoData ?? top25Data.find((crypto) => crypto.id === CRYPTO_IDS.NANO) ?? null

		if (!finalXnoData) {
			throw new UpstreamError('Failed to get XNO data')
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
			xnoData: finalXnoData,
			xnoPriceChange1h,
			xnoPriceChange24h,
			xnoPriceChange7d,
		}
	} catch (error) {
		// Re-throw custom errors as-is
		if (error instanceof RateLimitError || error instanceof ValidationError || error instanceof UpstreamError) {
			throw error
		}
		// Wrap unknown errors
		throw new UpstreamError(error instanceof Error ? error.message : 'Unknown error fetching market data')
	}
}
