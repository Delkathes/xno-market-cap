import { cacheLife } from 'next/cache'
import * as v from 'valibot'

import { CRYPTO_IDS } from '@/lib/constants'
import { fetchWithRetry } from '@/lib/fetch-with-timeout'
import type { CryptoData, MarketDataResponse, XnoPriceChangePerCurrency } from '@/lib/types'
import { CryptoDataArraySchema, ExchangeRatesSchema, XnoCoinDetailSchema } from '@/lib/validation'

import { env } from '@/env'

// Direct CoinGecko REST client. The official SDK instruments every request with
// Date.now() (timing stats, retry-After handling), which Next.js rejects inside
// cached functions during build-time cache seeding ("unstable value" error).
// Plain fetch keeps this module deterministic, so 'use cache' pages can be
// prerendered and seeded at build. Retries and 429 handling come from
// fetchWithRetry; rate limiting is handled by the cache layers around this.
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

export async function cgGet<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
	const url = new URL(COINGECKO_BASE_URL + path)
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value))
	}

	const response = await fetchWithRetry(
		url.toString(),
		{
			headers: {
				accept: 'application/json',
				'x-cg-demo-api-key': env.COINGECKO_API_KEY,
			},
			cache: 'no-store',
		},
		{ timeoutMs: 10000, retries: 3, baseDelayMs: 1000 },
	)

	if (response.status === 429) {
		throw new RateLimitError('CoinGecko API rate limit exceeded')
	}
	if (!response.ok) {
		throw new UpstreamError(`CoinGecko API error: HTTP ${response.status}`)
	}

	return (await response.json()) as T
}

// Dev-only in-memory cache: 'use cache' is a no-op during development, so every
// page reload would otherwise fire the full CoinGecko batch (~4 calls), easily
// exhausting the demo tier's 30 req/min limit.
const DEV_CACHE_TTL_MS = 60 * 1000

declare global {
	var __xnoMarketDataCache: { data: MarketDataResponse; expiresAt: number } | undefined
}

interface DevCacheEntry {
	data: MarketDataResponse
	expiresAt: number
}

function getDevCache(): DevCacheEntry | null {
	if (env.NODE_ENV !== 'development') return null
	const cached = globalThis.__xnoMarketDataCache
	if (cached && cached.expiresAt > Date.now()) {
		return cached
	}
	return null
}

function setDevCache(data: MarketDataResponse): void {
	if (env.NODE_ENV !== 'development') return
	globalThis.__xnoMarketDataCache = { data, expiresAt: Date.now() + DEV_CACHE_TTL_MS }
}

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

export interface FiatValue {
	code: string
	symbol: string
	perXno: number
	precision: number
}

export interface CompareCoin {
	id: string
	symbol: string
	name: string
	marketCapRank: number
	/** Coin logo URL (CoinGecko). */
	image: string
	/** Amount of this coin equivalent to 1 XNO (direct XNO rate, no fiat intermediate). */
	xnoRate: number
}

export interface CompareRates {
	coins: CompareCoin[]
	fiats: FiatValue[]
	fetchedAt: number
}

/**
 * Derived comparison rates: the top-100 feed is priced in USD, so the direct
 * XNO rate for each coin is coinUsd / xnoUsd (both from the same cached feed,
 * no extra API calls). CoinGecko does not support vs_currency=xno, so the
 * site's own derivation is used everywhere instead.
 */
export async function getCompareRates(): Promise<CompareRates> {
	'use cache'
	cacheLife('minutes')

	const market = await getMarketData()
	const xnoUsd = market.xnoData.current_price
	if (!xnoUsd || xnoUsd <= 0) {
		throw new UpstreamError('XNO price unavailable')
	}

	const usdRates: Record<string, number> = {
		eur: market.eurRate,
		gbp: market.gbpRate,
		jpy: market.jpyRate,
		chf: market.chfRate,
		cad: market.cadRate,
		aud: market.audRate,
	}

	const fiatMeta: { code: string; symbol: string; precision: number }[] = [
		{ code: 'USD', symbol: '$', precision: 2 },
		{ code: 'EUR', symbol: '€', precision: 2 },
		{ code: 'GBP', symbol: '£', precision: 2 },
		{ code: 'JPY', symbol: '¥', precision: 0 },
		{ code: 'CHF', symbol: 'Fr', precision: 2 },
		{ code: 'CAD', symbol: 'C$', precision: 2 },
		{ code: 'AUD', symbol: 'A$', precision: 2 },
	]

	const fiats: FiatValue[] = fiatMeta.map(({ code, symbol, precision }) => {
		const perXno = code === 'USD' ? xnoUsd : xnoUsd * (usdRates[code.toLowerCase()] ?? 0)
		return { code, symbol, perXno, precision }
	})

	const coins: CompareCoin[] = market.data
		.filter((crypto) => crypto.id !== CRYPTO_IDS.NANO && crypto.current_price > 0)
		.map((crypto) => ({
			id: crypto.id,
			symbol: crypto.symbol.toUpperCase(),
			name: crypto.name,
			marketCapRank: crypto.market_cap_rank,
			image: crypto.image,
			xnoRate: xnoUsd / crypto.current_price,
		}))
		.sort((a, b) => a.marketCapRank - b.marketCapRank)

	return { coins, fiats, fetchedAt: Date.now() }
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
	'use cache'
	cacheLife('minutes')

	const cached = getDevCache()
	if (cached) {
		return cached.data
	}

	try {
		// Top 100 by market cap: the table renders every row it receives.
		let marketsJson: unknown
		try {
			marketsJson = await cgGet('/coins/markets', {
				vs_currency: 'usd',
				order: 'market_cap_desc',
				per_page: 100,
				page: 1,
				sparkline: false,
				price_change_percentage: '1h,24h,7d',
			})
		} catch (error) {
			mapSdkError(error, 'top 25 cryptocurrencies')
		}

		const marketsResult = v.safeParse(CryptoDataArraySchema, marketsJson)
		if (!marketsResult.success) {
			console.error('Invalid API response structure for top 25:', marketsResult.issues)
			throw new ValidationError('Invalid API response structure for top 25 cryptocurrencies')
		}

		const marketsData: CryptoData[] = marketsResult.output.map((item) => ({
			...item,
			price_change_percentage_24h: item.price_change_percentage_24h ?? 0,
		}))

		// Check if XNO (Nano) is already in top 25
		const hasXNO = marketsData.some((crypto) => crypto.id === CRYPTO_IDS.NANO)

		// Build parallel fetch promises
		const fetchXno = async (): Promise<CryptoData | null> => {
			if (hasXNO) return null
			try {
				const xnoJson = await cgGet('/coins/markets', {
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
				const ratesJson = await cgGet('/simple/price', {
					ids: 'nano',
					vs_currencies: 'usd,eur,gbp,jpy,chf,cad,aud',
				})
				return ratesJson
			} catch (error) {
				mapSdkError(error, 'exchange rates')
			}
		}

		const fetchXnoDetail = async () => {
			try {
				const xnoDetailJson = await cgGet('/coins/nano', {
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

		// Parse exchange rates (XNO price per currency, then derive USD->fiat rates)
		const ratesResult = v.safeParse(ExchangeRatesSchema, ratesJson)
		if (!ratesResult.success || !ratesResult.output.nano) {
			throw new ValidationError('Invalid exchange rates response')
		}

		const {
			usd: usdPrice,
			eur: eurPrice,
			gbp: gbpPrice,
			jpy: jpyPrice,
			chf: chfPrice,
			cad: cadPrice,
			aud: audPrice,
		} = ratesResult.output.nano
		if (
			usdPrice === undefined ||
			eurPrice === undefined ||
			gbpPrice === undefined ||
			jpyPrice === undefined ||
			chfPrice === undefined ||
			cadPrice === undefined ||
			audPrice === undefined
		) {
			throw new ValidationError('Missing required exchange rates')
		}

		const eurRate = eurPrice / usdPrice
		const gbpRate = gbpPrice / usdPrice
		const jpyRate = jpyPrice / usdPrice
		const chfRate = chfPrice / usdPrice
		const cadRate = cadPrice / usdPrice
		const audRate = audPrice / usdPrice

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
		const finalXnoData = xnoData ?? marketsData.find((crypto) => crypto.id === CRYPTO_IDS.NANO) ?? null

		if (!finalXnoData) {
			throw new UpstreamError('Failed to get XNO data')
		}

		// Combine data: top 25 + XNO if not already included
		const combinedData = hasXNO ? marketsData : [...marketsData, ...(xnoData ? [xnoData] : [])]

		// Sort by market cap rank
		combinedData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)

		const result: MarketDataResponse = {
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
		setDevCache(result)
		return result
	} catch (error) {
		// Re-throw custom errors as-is
		if (error instanceof RateLimitError || error instanceof ValidationError || error instanceof UpstreamError) {
			throw error
		}
		// Wrap unknown errors
		throw new UpstreamError(error instanceof Error ? error.message : 'Unknown error fetching market data')
	}
}
