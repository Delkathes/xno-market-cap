import { Fragment } from 'react'

import type { FiatCurrency } from '@/lib/constants'
import {
	type ExchangeRates,
	formatCryptoMarketCap,
	formatCryptoPrice,
	formatFiatMarketCap,
	formatFiatPrice,
	getFiatRate,
} from '@/lib/currency-helpers'

/**
 * The site's currency hierarchy in widget form: one primary fiat currency
 * drives the main value; the secondary strip shows the same value in the
 * configured secondary fiat currencies (all others by default) and the
 * picked crypto assets (top-10). XNO stays the primary crypto (the big value
 * is always 1 XNO or a balance denominated in it).
 */
export function SecondaryFiatStrip({
	usdValue,
	fiats,
	rates,
	locale,
	variant = 'price',
	cryptos,
}: {
	/** Value denominated in USD, converted to each fiat/crypto. */
	usdValue: number
	/** Secondary fiat currencies to show (primary excluded by the caller). */
	fiats: FiatCurrency[]
	rates: ExchangeRates
	locale: string
	variant?: 'price' | 'cap'
	/** Picked cryptos: each appends "… · 0.0000054 BTC" to the line. */
	cryptos: { symbol: string; usdPrice: number }[]
}) {
	return (
		<div
			aria-hidden="true"
			className="widget-strip overflow-x-auto whitespace-nowrap font-mono text-[9px] tabular-nums text-muted-foreground/80"
		>
			{fiats.map((currency, index) => (
				<Fragment key={currency}>
					{index > 0 && <span className="mx-1 text-muted-foreground/30">·</span>}
					<span className="whitespace-nowrap">
						{variant === 'cap'
							? formatFiatMarketCap(usdValue * getFiatRate(currency, rates), currency)
							: formatFiatPrice(usdValue * getFiatRate(currency, rates), currency, locale)}
					</span>
				</Fragment>
			))}
			{cryptos.map((crypto) => (
				<Fragment key={crypto.symbol}>
					<span className="mx-1 text-muted-foreground/30">·</span>
					<span className="whitespace-nowrap">
						{crypto.usdPrice > 0
							? variant === 'cap'
								? formatCryptoMarketCap(usdValue / crypto.usdPrice, { symbol: crypto.symbol }, locale)
								: formatCryptoPrice(usdValue / crypto.usdPrice, { symbol: crypto.symbol })
							: '—'}
					</span>
				</Fragment>
			))}
		</div>
	)
}
