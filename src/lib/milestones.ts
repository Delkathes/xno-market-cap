import { FiatCurrency } from '@/lib/constants'
import { getFiatSymbol } from '@/lib/currency-helpers'

// Round milestones per currency: each ladder is native to its unit, so every
// target is a round number in the displayed currency. Every ladder tops out at
// 1000B in its own unit (1B/2B/5B/... USD/EUR/GBP, 10B/20B/50B/... JPY). The
// JPY ladder goes to ¥100T (~$670B) so the simulator range matches the others
// in USD-equivalent terms.
const MILESTONES_STANDARD = [1e9, 2e9, 5e9, 1e10, 2e10, 5e10, 1e11, 2e11, 5e11, 1e12]
const MILESTONES_JPY = [1e10, 2e10, 5e10, 1e11, 2e11, 5e11, 1e12, 2e12, 5e12, 1e13, 2e13, 5e13, 1e14]

export const MILESTONES_BY_CURRENCY: Record<FiatCurrency, number[]> = {
	[FiatCurrency.USD]: MILESTONES_STANDARD,
	[FiatCurrency.EUR]: MILESTONES_STANDARD,
	[FiatCurrency.GBP]: MILESTONES_STANDARD,
	[FiatCurrency.CHF]: MILESTONES_STANDARD,
	[FiatCurrency.CAD]: MILESTONES_STANDARD,
	[FiatCurrency.AUD]: MILESTONES_STANDARD,
	[FiatCurrency.JPY]: MILESTONES_JPY,
}

/** All fiat currencies in display order (USD first as the canonical unit). */
export const MILESTONE_CURRENCIES: FiatCurrency[] = [
	FiatCurrency.USD,
	FiatCurrency.EUR,
	FiatCurrency.GBP,
	FiatCurrency.JPY,
	FiatCurrency.CHF,
	FiatCurrency.CAD,
	FiatCurrency.AUD,
]

/**
 * Nice-number step: round the raw step to the closest 1/2/5 × 10^k so
 * labels stay readable.
 */
export function niceStep(range: number): number {
	const power = 10 ** Math.floor(Math.log10(range / 4))
	const digit = range / 4 / power
	const nice = digit >= 7.5 ? 10 : digit >= 3.5 ? 5 : digit >= 1.5 ? 2 : 1
	return nice * power
}

function trimDecimals(value: number): string {
	return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)
}

/** Compact value label: $2B, €12.5B, ¥1T ... */
export function shortCap(value: number, currency: FiatCurrency): string {
	const symbol = getFiatSymbol(currency)
	if (value >= 1e12) return `${symbol}${trimDecimals(value / 1e12)}T`
	if (value >= 1e9) return `${symbol}${trimDecimals(value / 1e9)}B`
	if (value >= 1e6) return `${symbol}${trimDecimals(value / 1e6)}M`
	return `${symbol}${value.toFixed(0)}`
}

/** Prev/next milestone window for a value in a currency's native ladder. */
export function milestoneWindow(milestones: number[], value: number): { prev: number; next: number; progress: number } {
	const prev = milestones.filter((milestone) => milestone <= value).at(-1) ?? 0
	const next = milestones.find((milestone) => milestone > value) ?? prev * 2
	const progress = next > prev ? Math.min(1, Math.max(0, (value - prev) / (next - prev))) : 1
	return { prev, next, progress }
}
