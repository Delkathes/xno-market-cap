'use client'

import { useMemo, useState } from 'react'

import type { FiatCurrency } from '@/lib/constants'
import { type ExchangeRates, formatFiatPrice, getFiatRate } from '@/lib/currency-helpers'

import { SecondaryFiatStrip } from '@/components/widgets/secondary-fiat-strip'
import { WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetStrings } from '@/components/widgets/widget-registry'

/** Interactive XNO ↔ fiat converter. The price is injected server-side as a
 * prop (embeds can't call our API cross-origin), so no client fetch at all. */
export function CalculatorWidget({
	t,
	currency,
	priceUsd,
	rates,
	locale,
	fiats,
	cryptos,
	compact,
}: {
	t: WidgetStrings
	currency: FiatCurrency
	priceUsd: number
	rates: ExchangeRates
	locale: string
	/** Secondary fiat currencies for the strip (primary excluded). */
	fiats: FiatCurrency[]
	/** Picked cryptos the result is also shown in. */
	cryptos: { symbol: string; usdPrice: number }[]
	compact: boolean
}) {
	// mode: 'xno' → amount is XNO, result is fiat; 'fiat' → the reverse.
	const [mode, setMode] = useState<'xno' | 'fiat'>('xno')
	const [amount, setAmount] = useState('')

	const pricePrimary = priceUsd * getFiatRate(currency, rates)

	const parsed = useMemo(() => {
		const value = Number.parseFloat(amount.replace(',', '.'))
		return Number.isFinite(value) && value > 0 ? value : null
	}, [amount])

	const result =
		parsed !== null
			? mode === 'xno'
				? parsed * pricePrimary
				: pricePrimary > 0
					? parsed / pricePrimary
					: null
			: null
	const usdValue =
		parsed !== null
			? mode === 'xno'
				? parsed * priceUsd
				: pricePrimary > 0
					? (parsed / pricePrimary) * priceUsd
					: 0
			: 0

	const swap = () => {
		setMode((current) => (current === 'xno' ? 'fiat' : 'xno'))
		setAmount('')
	}

	return (
		<WidgetFrame label={t.typeCalculator} led="cyan" height={compact ? 178 : 214}>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted-foreground/60">
						{mode === 'xno' ? 'XNO' : currency}
					</span>
					<input
						type="text"
						inputMode="decimal"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						placeholder={t.calcHint}
						className="h-9 w-full min-w-0 flex-1 rounded-sm border border-border bg-muted/30 px-2 font-mono text-sm tabular-nums outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-[#209CE9]/70 focus:bg-muted/50"
						aria-label={t.calcAmountLabel}
					/>
					<button
						type="button"
						onClick={swap}
						title={t.calcToggle}
						className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-sm border border-dashed border-border text-muted-foreground transition-colors hover:border-[#209CE9]/70 hover:text-[#209CE9]"
						aria-label={t.calcToggle}
					>
						<span aria-hidden="true" className="font-mono text-sm leading-none">
							⇄
						</span>
					</button>
				</div>
				<div className="flex items-baseline justify-between gap-3 border-t border-dashed border-border/70 pt-2">
					<span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted-foreground/60">
						{mode === 'xno' ? currency : 'XNO'}
					</span>
					<span className="font-mono text-[22px] font-bold leading-none tracking-tight tabular-nums text-[#209CE9]">
						{result === null
							? '—'
							: mode === 'xno'
								? formatFiatPrice(result, currency, locale)
								: `${result.toLocaleString(locale, { maximumFractionDigits: 4 })} XNO`}
					</span>
				</div>
				{!compact && result !== null && (
					<div className="border-t border-dashed border-border/70 pt-1.5">
						<SecondaryFiatStrip
							usdValue={usdValue}
							rates={rates}
							locale={locale}
							fiats={fiats}
							cryptos={cryptos}
						/>
					</div>
				)}
			</div>
		</WidgetFrame>
	)
}
