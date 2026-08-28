export const COMPARE_COOKIE_NAME = 'xno_compare_coins'
export const COMPARE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
export const COMPARE_COIN_LIMIT = 6
export const DEFAULT_COMPARE_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE']

const SYMBOL_PATTERN = /^[A-Z0-9]{2,10}$/

export function parseCompareCookie(value: string | undefined): string[] {
	if (!value) return []
	try {
		const parsed: unknown = JSON.parse(value)
		if (!Array.isArray(parsed)) return []
		return parsed
			.filter((entry): entry is string => typeof entry === 'string' && SYMBOL_PATTERN.test(entry))
			.slice(0, COMPARE_COIN_LIMIT)
	} catch {
		return []
	}
}

export function normalizeTickers(tickers: string[]): string[] {
	const seen = new Set<string>()
	const clean: string[] = []
	for (const ticker of tickers) {
		const symbol = ticker.trim().toUpperCase()
		if (symbol && SYMBOL_PATTERN.test(symbol) && !seen.has(symbol)) {
			seen.add(symbol)
			clean.push(symbol)
		}
		if (clean.length >= COMPARE_COIN_LIMIT) break
	}
	return clean
}

export function filterToKnown(tickers: string[], known: ReadonlySet<string>): string[] {
	const out: string[] = []
	for (const ticker of tickers) {
		if (known.has(ticker) && !out.includes(ticker)) out.push(ticker)
		if (out.length >= COMPARE_COIN_LIMIT) break
	}
	return out
}
