import { FiatCurrency } from '@/lib/constants'

import type { default as enWidgets } from '../../../messages/widgets/en.json'

export type WidgetStrings = typeof enWidgets

export type WidgetType = 'price' | 'market-cap' | 'calculator' | 'network' | 'account' | 'live' | 'donate'

export const WIDGET_TYPES: WidgetType[] = ['price', 'market-cap', 'calculator', 'network', 'account', 'live', 'donate']

/** Widgets shipped so far. Everything else shows a SOON badge. */
export const AVAILABLE_WIDGETS: WidgetType[] = [
	'price',
	'market-cap',
	'calculator',
	'network',
	'account',
	'live',
	'donate',
]

/** Default address for account/donation widgets (community demo address). */
export const DEFAULT_ACCOUNT_ADDRESS = 'nano_335o96s1kje9jzwukjkqt74iatrfqz4uoue7ocxpce95eukmicpyjmj1ke81'

export const WIDGET_LOCALES = ['en', 'fr', 'de', 'es', 'it', 'nl'] as const
export type WidgetLocale = (typeof WIDGET_LOCALES)[number]

export const WIDGET_CURRENCIES = Object.values(FiatCurrency)

export type WidgetRange = '24h' | '7d'
export type WidgetVariant = 'normal' | 'btc'

export interface WidgetParams {
	/** Primary fiat currency: the big value. */
	currency: FiatCurrency
	/** Explicit secondary fiat currencies for the strip; null = all except primary. */
	secondaryFiats: FiatCurrency[] | null
	/** Explicit crypto symbols for the strip; null = default ['BTC']. */
	cryptos: string[] | null
	range: WidgetRange
	variant: WidgetVariant
	compact: boolean
}

export const DEFAULT_WIDGET_PARAMS: WidgetParams = {
	currency: FiatCurrency.USD,
	secondaryFiats: null,
	cryptos: null,
	range: '24h',
	variant: 'normal',
	compact: false,
}

/** Secondary fiats when none configured: every currency except the primary. */
export function defaultSecondaryFiats(primary: FiatCurrency): FiatCurrency[] {
	return WIDGET_CURRENCIES.filter((currency) => currency !== primary)
}

/** Cryptos when none configured. */
export const DEFAULT_CRYPTOS: string[] = ['BTC']

/** USD/EUR-pegged assets excluded from the pickable crypto list. */
const STABLECOIN_SYMBOLS = new Set([
	'USDT',
	'USDC',
	'DAI',
	'FDUSD',
	'USDS',
	'PYUSD',
	'TUSD',
	'BUSD',
	'USDE',
	'USDD',
	'GUSD',
	'FRAX',
	'LUSD',
	'DOLA',
	'USD1',
	'EURC',
	'EURT',
	'AEUR',
])

export function isStablecoinSymbol(symbol: string): boolean {
	return STABLECOIN_SYMBOLS.has(symbol.toUpperCase())
}

/** Advertised iframe height per widget (full / compact). */
export const WIDGET_HEIGHTS: Record<WidgetType, { full: number; compact: number }> = {
	price: { full: 228, compact: 178 },
	'market-cap': { full: 214, compact: 164 },
	calculator: { full: 214, compact: 178 },
	network: { full: 240, compact: 190 },
	account: { full: 246, compact: 196 },
	live: { full: 248, compact: 208 },
	donate: { full: 236, compact: 200 },
}

export function isWidgetType(value: string): value is WidgetType {
	return (WIDGET_TYPES as string[]).includes(value)
}

export function isWidgetLocale(value: string): value is WidgetLocale {
	return (WIDGET_LOCALES as readonly string[]).includes(value)
}

function toCurrency(value: unknown): FiatCurrency {
	const upper = typeof value === 'string' ? value.toUpperCase() : ''
	return (WIDGET_CURRENCIES as string[]).includes(upper) ? (upper as FiatCurrency) : FiatCurrency.USD
}

function toCrypto(value: unknown): string {
	if (typeof value !== 'string') return 'BTC'
	const upper = value.toUpperCase()
	return /^[A-Z0-9]{1,10}$/.test(upper) ? upper : 'BTC'
}

/** Comma-separated list → validated entries; null when absent (defaults apply). */
function toList(value: unknown, validate: (entry: string) => boolean): string[] | null {
	if (value === undefined) return null
	if (typeof value !== 'string') return []
	return value
		.split(',')
		.map((entry) => entry.trim().toUpperCase())
		.filter((entry) => entry !== '' && validate(entry))
		.slice(0, 12)
}

function toRange(value: unknown): WidgetRange {
	return value === '7d' ? '7d' : '24h'
}

function toVariant(value: unknown): WidgetVariant {
	return value === 'btc' ? 'btc' : 'normal'
}

function toBool(value: unknown): boolean {
	return value === '1' || value === 'true' || value === 'compact'
}

/** Parses embed query params with safe fallbacks — bad params never break an embed. */
export function parseWidgetParams(searchParams: Record<string, string | string[] | undefined>): WidgetParams {
	const currency = toCurrency(searchParams.currency)
	const isFiat = (entry: string) => (WIDGET_CURRENCIES as string[]).includes(entry)
	const cryptos =
		toList(searchParams.cryptos, (entry) => /^[A-Z0-9]{1,10}$/.test(entry)) ??
		// Legacy single-crypto param still works.
		(searchParams.crypto !== undefined ? [toCrypto(searchParams.crypto)] : null)
	return {
		currency,
		secondaryFiats: toList(searchParams.fiats, isFiat)?.map((entry) => entry as FiatCurrency) ?? null,
		cryptos,
		range: toRange(searchParams.range),
		variant: toVariant(searchParams.variant),
		compact: toBool(searchParams.compact),
	}
}

export function buildEmbedUrl(
	siteUrl: string,
	locale: WidgetLocale,
	type: WidgetType,
	params: Partial<WidgetParams> = {},
	address?: string,
): string {
	const query = new URLSearchParams()
	if (params.currency && params.currency !== FiatCurrency.USD) query.set('currency', params.currency)
	if (params.secondaryFiats) {
		const defaults = defaultSecondaryFiats(params.currency ?? FiatCurrency.USD)
		const explicit =
			params.secondaryFiats.length !== defaults.length ||
			params.secondaryFiats.some((entry) => entry !== undefined && !defaults.includes(entry))
		if (explicit) query.set('fiats', params.secondaryFiats.join(','))
	}
	if (params.cryptos) {
		const isDefault = params.cryptos.length === 1 && params.cryptos[0] === 'BTC'
		if (!isDefault) query.set('cryptos', params.cryptos.join(','))
	}
	if (params.range && params.range !== '24h') query.set('range', params.range)
	if (params.variant && params.variant !== 'normal') query.set('variant', params.variant)
	if (params.compact) query.set('compact', '1')
	if (address) query.set('address', address)
	const qs = query.toString()
	return `${siteUrl}/widgets/embed/${locale}/${type}${qs ? `?${qs}` : ''}`
}

/** Stable locale label used in the builder chips. */
export const LOCALE_LABELS: Record<WidgetLocale, string> = {
	en: '🇬🇧',
	fr: '🇫🇷',
	de: '🇩🇪',
	es: '🇪🇸',
	it: '🇮🇹',
	nl: '🇳🇱',
}

// Explicit per-locale imports (a template import can't be statically analyzed).
export const WIDGET_MESSAGES = {
	en: () => import('../../../messages/widgets/en.json'),
	fr: () => import('../../../messages/widgets/fr.json'),
	de: () => import('../../../messages/widgets/de.json'),
	es: () => import('../../../messages/widgets/es.json'),
	it: () => import('../../../messages/widgets/it.json'),
	nl: () => import('../../../messages/widgets/nl.json'),
} satisfies Record<WidgetLocale, () => Promise<{ default: WidgetStrings }>>
