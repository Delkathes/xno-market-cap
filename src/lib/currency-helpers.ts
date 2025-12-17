import { FIAT_CURRENCY_CONFIG, FiatCurrency } from './constants'

/**
 * Exchange rates object structure returned by useMarketData
 */
export interface ExchangeRates {
	eurRate?: number
	gbpRate?: number
	jpyRate?: number
	chfRate?: number
	cadRate?: number
	audRate?: number
}

/**
 * 24h price change per currency structure
 */
export interface PriceChange24h {
	usd: number
	eur: number
	gbp: number
	jpy: number
	chf: number
	cad: number
	aud: number
}

/**
 * Get exchange rate for a given fiat currency
 * USD is the base currency (rate = 1)
 */
export function getFiatRate(currency: FiatCurrency, rates: ExchangeRates): number {
	switch (currency) {
		case FiatCurrency.EUR:
			return rates.eurRate ?? 1
		case FiatCurrency.GBP:
			return rates.gbpRate ?? 1
		case FiatCurrency.JPY:
			return rates.jpyRate ?? 1
		case FiatCurrency.CHF:
			return rates.chfRate ?? 1
		case FiatCurrency.CAD:
			return rates.cadRate ?? 1
		case FiatCurrency.AUD:
			return rates.audRate ?? 1
		default:
			return 1
	}
}

/**
 * Get 24h price change for a given fiat currency
 */
export function getPriceChange(currency: FiatCurrency, priceChange24h: PriceChange24h | undefined): number {
	if (!priceChange24h) return 0
	switch (currency) {
		case FiatCurrency.EUR:
			return priceChange24h.eur
		case FiatCurrency.GBP:
			return priceChange24h.gbp
		case FiatCurrency.JPY:
			return priceChange24h.jpy
		case FiatCurrency.CHF:
			return priceChange24h.chf
		case FiatCurrency.CAD:
			return priceChange24h.cad
		case FiatCurrency.AUD:
			return priceChange24h.aud
		default:
			return priceChange24h.usd
	}
}

/**
 * Get the currency symbol for a fiat currency
 */
export function getFiatSymbol(currency: FiatCurrency): string {
	return FIAT_CURRENCY_CONFIG[currency].symbol
}

/**
 * Get the currency label for a fiat currency
 */
export function getFiatLabel(currency: FiatCurrency): string {
	return FIAT_CURRENCY_CONFIG[currency].label
}

/**
 * Check if a currency uses large number formatting (like JPY)
 */
export function isLargeNumberCurrency(currency: FiatCurrency): boolean {
	return currency === FiatCurrency.JPY
}

/**
 * Format a market cap value with appropriate suffix (M, B, T)
 */
export function formatMarketCap(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)
	const isJpy = isLargeNumberCurrency(currency)

	if (isJpy) {
		return value >= 1e12 ? `${symbol}${(value / 1e12).toFixed(2)}T` : `${symbol}${(value / 1e9).toFixed(0)}B`
	}
	return value >= 1e9 ? `${symbol}${(value / 1e9).toFixed(2)}B` : `${symbol}${(value / 1e6).toFixed(2)}M`
}

/**
 * Format a price value based on currency
 */
export function formatFiatPrice(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)
	const isJpy = isLargeNumberCurrency(currency)

	if (isJpy) return `${symbol}${value.toFixed(0)}`
	return `${symbol}${value.toFixed(2)}`
}

/**
 * Format a price with smart decimal handling
 */
export function formatSmartPrice(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)
	const isJpy = isLargeNumberCurrency(currency)

	if (isJpy) {
		return value >= 1000000
			? `${symbol}${(value / 1000000).toFixed(2)}M`
			: value >= 1000
				? `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
				: `${symbol}${value.toFixed(0)}`
	}
	return value >= 1000
		? `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
		: value >= 1
			? `${symbol}${value.toFixed(2)}`
			: `${symbol}${value.toFixed(4)}`
}
