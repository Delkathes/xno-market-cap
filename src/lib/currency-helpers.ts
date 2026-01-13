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
 * Check if a currency uses large number formatting (like JPY)
 */
export function isLargeNumberCurrency(currency: FiatCurrency): boolean {
	return currency === FiatCurrency.JPY
}

/**
 * Format a market cap value with appropriate suffix (M, B, T)
 */
export function formatFiatMarketCap(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)

	if (isLargeNumberCurrency(currency)) {
		return value >= 1e12 ? `${symbol}${(value / 1e12).toFixed(2)}T` : `${symbol}${(value / 1e9).toFixed(0)}B`
	}
	return value >= 1e9 ? `${symbol}${(value / 1e9).toFixed(2)}B` : `${symbol}${(value / 1e6).toFixed(2)}M`
}

/**
 * Format a price value
 */

export function formatPrice(value: number): string {
	if (value >= 1e4) {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		})
	} else if (value >= 1e3) {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		})
	} else if (value >= 10) {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		})
	} else if (value >= 1) {
		return value.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		})
	} else if (value >= 0.1) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 4,
			maximumFractionDigits: 4,
		})
	} else if (value >= 0.01) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 5,
			maximumFractionDigits: 5,
		})
	} else if (value >= 0.001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 6,
			maximumFractionDigits: 6,
		})
	} else if (value >= 0.0001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 7,
			maximumFractionDigits: 7,
		})
	} else if (value >= 0.00001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 8,
			maximumFractionDigits: 8,
		})
	} else if (value >= 0.000001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 9,
			maximumFractionDigits: 9,
		})
	} else if (value >= 0.0000001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 10,
			maximumFractionDigits: 10,
		})
	} else if (value >= 0.00000001) {
		return value.toLocaleString(undefined, {
			minimumFractionDigits: 11,
			maximumFractionDigits: 11,
		})
	}

	return value.toLocaleString()
}

/**
 * Format a price value based on currency
 */
export function formatFiatPrice(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)

	if (isLargeNumberCurrency(currency))
		return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
	return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

/**
 * Format a price with smart decimal handling
 */
export function formatSmartFiatPrice(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)

	if (isLargeNumberCurrency(currency)) {
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

// =============================================================================
// LARGE NUMBER FORMATTING
// =============================================================================

export interface FormatLargeNumberOptions {
	/** Unit suffix to append (e.g., 'XNO', 'BTC', 'kg') */
	unit?: string
	/** Number of decimal places (default: 2) */
	decimals?: number
	/** Include K (thousands) threshold (default: false) */
	includeK?: boolean
	/** Use locale-aware formatting for the number (default: true) */
	useLocale?: boolean
}

/**
 * Format a large number with T/B/M/K suffixes
 * @example formatLargeNumber(1234567890) // "1.23B"
 * @example formatLargeNumber(1234567890, { unit: 'XNO' }) // "1.23B XNO"
 * @example formatLargeNumber(1500, { includeK: true }) // "1.50K"
 */
export function formatLargeNumber(value: number, options: FormatLargeNumberOptions = {}): string {
	const { unit, decimals = 2, includeK = false, useLocale = true } = options
	const suffix = unit ? ` ${unit}` : ''

	const formatNum = (num: number, dec: number) =>
		useLocale
			? num.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
			: num.toFixed(dec)

	if (value >= 1e12) {
		return `${formatNum(value / 1e12, decimals)}T${suffix}`
	}
	if (value >= 1e9) {
		return `${formatNum(value / 1e9, decimals)}B${suffix}`
	}
	if (value >= 1e6) {
		return `${formatNum(value / 1e6, decimals)}M${suffix}`
	}
	if (includeK && value >= 1e3) {
		return `${formatNum(value / 1e3, decimals)}K${suffix}`
	}
	return `${formatNum(value, decimals)}${suffix}`
}

// =============================================================================
// XNO AMOUNT FORMATTING
// =============================================================================

export interface FormatXNOAmountOptions {
	/** Show Ӿ symbol prefix (default: false) */
	showSymbol?: boolean
	/** Use compact notation with M/K suffixes (default: true for large values) */
	compact?: boolean
}

/**
 * Format XNO amounts with smart decimals
 * - >= 1M: "1.23M XNO"
 * - >= 1K: "1.23K XNO" or "1,234 XNO"
 * - >= 1: "123.45 XNO" (2 decimals)
 * - >= 0.01: "0.1234 XNO" (4 decimals)
 * - < 0.01: "0.123456 XNO" (6 decimals)
 */
export function formatXNOAmount(value: number, options: FormatXNOAmountOptions = {}): string {
	const { showSymbol = false, compact = true } = options
	const prefix = showSymbol ? 'Ӿ' : ''
	const suffix = showSymbol ? '' : ' XNO'

	if (compact) {
		if (value >= 1e6) {
			return `${prefix}${(value / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M${suffix}`
		}
		if (value >= 1e3) {
			return `${prefix}${(value / 1e3).toLocaleString(undefined, { maximumFractionDigits: 2 })}K${suffix}`
		}
	} else if (value >= 1e5) {
		return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}${suffix}`
	} else if (value >= 1e3) {
		return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`
	}

	if (value >= 1) {
		return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}${suffix}`
	} else if (value >= 0.1) {
		return `${prefix}${value.toFixed(1)}${suffix}`
	} else if (value >= 0.01) {
		return `${prefix}${value.toFixed(2)}${suffix}`
	} else if (value >= 0.001) {
		return `${prefix}${value.toFixed(3)}${suffix}`
	} else if (value >= 0.0001) {
		return `${prefix}${value.toFixed(4)}${suffix}`
	} else if (value >= 0.00001) {
		return `${prefix}${value.toFixed(5)}${suffix}`
	} else if (value >= 0.000001) {
		return `${prefix}${value.toFixed(6)}${suffix}`
	} else if (value >= 0.0000001) {
		return `${prefix}${value.toFixed(7)}${suffix}`
	} else if (value >= 0.00000001) {
		return `${prefix}${value.toFixed(8)}${suffix}`
	}
	return `${prefix}${value.toFixed(9)}${suffix}`
}

// =============================================================================
// PERCENTAGE FORMATTING
// =============================================================================

export interface FormatPercentageOptions {
	/** High precision mode for tiny values (uses adaptive decimals, default: false) */
	highPrecision?: boolean
	/** Show + sign for positive values (default: false) */
	showSign?: boolean
	/** Default decimal places for standard mode (default: 2) */
	decimals?: number
}

/**
 * Format percentage values with smart precision
 * Standard mode: "12.34%"
 * High precision mode: adaptive decimals for tiny values, exponential for extremely small
 */
export function formatPercentage(value: number, options: FormatPercentageOptions = {}): string {
	const { highPrecision = false, showSign = false, decimals = 2 } = options
	const sign = showSign && value > 0 ? '+' : ''

	if (highPrecision) {
		// Adaptive precision for tiny percentages (useful for supply/dominance)
		if (value >= 1) return `${sign}${value.toFixed(2)}%`
		if (value >= 0.01) return `${sign}${value.toFixed(4)}%`
		if (value >= 0.0001) return `${sign}${value.toFixed(6)}%`
		if (value >= 0.000001) return `${sign}${value.toFixed(8)}%`
		if (value >= 0.00000001) return `${sign}${value.toFixed(10)}%`
		if (value >= 0.0000000001) return `${sign}${value.toFixed(12)}%`
		if (value === 0) return '0%'
		return `${sign}${value.toExponential(2)}%`
	}

	return `${sign}${value.toFixed(decimals)}%`
}

// =============================================================================
// CRYPTO PRICE FORMATTING
// =============================================================================

export interface FormatCryptoPriceOptions {
	/** Crypto symbol (e.g., 'BTC', 'ETH') */
	symbol: string
	/** For BTC: display as satoshis instead of BTC (default: false) */
	asSatoshi?: boolean
	/** Number of decimal places (default: auto-detected based on symbol) */
	decimals?: number
}

/**
 * Format crypto-to-crypto prices
 * - BTC: 8 decimals or satoshis (1 BTC = 100,000,000 sats)
 * - Other: 6 decimals by default
 */
export function formatCryptoPrice(value: number, options: FormatCryptoPriceOptions): string {
	const { symbol, asSatoshi = false, decimals } = options
	const upperSymbol = symbol.toUpperCase()

	if (upperSymbol === 'BTC') {
		if (asSatoshi) {
			return `${Math.round(value * 1e8).toLocaleString()} sats`
		}
		return `${value.toFixed(decimals ?? 8)} BTC`
	}

	// Default decimals based on typical value ranges
	const dec = decimals ?? 6
	return `${value.toFixed(dec)} ${upperSymbol}`
}

/**
 * Format market cap expressed in cryptocurrency units
 * Uses fewer decimals than price since market caps are larger values
 */
export function formatCryptoMarketCap(value: number, options: FormatCryptoPriceOptions): string {
	const { symbol, asSatoshi = false, decimals } = options
	const upperSymbol = symbol.toUpperCase()

	if (upperSymbol === 'BTC') {
		if (asSatoshi) {
			return `${Math.round(value * 1e8).toLocaleString()} sats`
		}
		return `${value.toLocaleString(undefined, { minimumFractionDigits: decimals ?? 2, maximumFractionDigits: decimals ?? 2 })} BTC`
	}

	return `${value.toLocaleString(undefined, { minimumFractionDigits: decimals ?? 2, maximumFractionDigits: decimals ?? 2 })} ${upperSymbol}`
}

// =============================================================================
// SUPPLY FORMATTING
// =============================================================================

export type SupplyType = 'fiat' | 'crypto' | 'commodity'

export interface FormatSupplyOptions {
	/** Type of asset for appropriate formatting */
	type: SupplyType
	/** Symbol for fiat currencies (e.g., '$', '€') */
	symbol?: string
	/** Unit for commodities (e.g., 'kg', 'oz') */
	unit?: string
}

/**
 * Format supply values based on asset type
 * - Fiat: "$12.3T" (trillions with currency symbol)
 * - Crypto: "19.5M" or "133,248,297" (millions or locale string)
 * - Commodity: "12.3M kg" (with unit)
 */
export function formatSupply(value: number, options: FormatSupplyOptions): string {
	const { type, symbol = '', unit = '' } = options

	if (type === 'fiat') {
		const trillions = value / 1e12
		return `${symbol}${trillions.toFixed(1)}T`
	}

	if (type === 'commodity') {
		return `${(value / 1e6).toFixed(0)}M ${unit}`.trim()
	}

	// Crypto
	if (value >= 1e6) {
		return `${(value / 1e6).toFixed(1)}M`
	}
	return value.toLocaleString()
}

/**
 * Format max supply (handles infinity/unlimited)
 */
export function formatMaxSupply(value: number | null, options: FormatSupplyOptions): string {
	if (value === null) return '∞'
	return formatSupply(value, options)
}

// =============================================================================
// PARITY VALUE FORMATTING
// =============================================================================

export interface FormatParityValueOptions {
	/** Symbol for fiat (e.g., '$') or unit for crypto/commodity */
	symbol?: string
	/** Unit suffix (e.g., 'oz', 'XNO') */
	unit?: string
	/** Asset type for formatting rules */
	type: SupplyType
	/** Fiat currency for JPY-aware formatting */
	currency?: FiatCurrency
}

/**
 * Format parity values (exchange rates between assets)
 * Handles fiat (with JPY special case), crypto, and commodities
 */
export function formatParityValue(value: number, options: FormatParityValueOptions): string {
	const { symbol = '', unit = '', type, currency } = options

	if (type === 'fiat') {
		if (currency && isLargeNumberCurrency(currency)) {
			if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(0)}B`
			if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(0)}M`
			if (value >= 1e3) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
			return `${symbol}${value.toFixed(0)}`
		}

		if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(0)}M`
		if (value >= 1e3) return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
		if (value >= 1) return `${symbol}${value.toFixed(2)}`
		return `${symbol}${value.toFixed(8)}`
	}

	// Commodity: 3 decimals
	if (type === 'commodity') {
		const decimals = value >= 100 ? 0 : value >= 10 ? 2 : 3
		return `${value.toFixed(decimals)} ${unit}`.trim()
	}

	// Crypto: adaptive decimals
	if (value >= 1) {
		const decimals = value >= 100 ? 0 : value >= 10 ? 2 : 3
		return `${value.toFixed(decimals)} ${unit}`.trim()
	}
	return `${value.toFixed(4)} ${unit}`.trim()
}

/**
 * Format parity value for highlight cards (shorter format)
 */
export function formatParityHighlight(value: number, options: FormatParityValueOptions): string {
	const { symbol = '', unit = '', type } = options

	if (type === 'fiat') {
		return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
	}

	const decimals = type === 'commodity' ? 3 : 4
	return `${value.toFixed(decimals)} ${unit}`.trim()
}
