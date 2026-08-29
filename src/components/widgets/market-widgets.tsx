import type { FiatCurrency } from '@/lib/constants'
import {
	type ExchangeRates,
	formatFiatMarketCap,
	formatFiatPrice,
	formatPercentage,
	getFiatRate,
} from '@/lib/currency-helpers'
import type { MarketDataResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

import { SecondaryFiatStrip } from '@/components/widgets/secondary-fiat-strip'
import { WidgetDivider, WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetParams, WidgetStrings } from '@/components/widgets/widget-registry'

function formatSupply(xno: number, locale?: string): string {
	if (xno >= 1_000_000) return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	return xno.toLocaleString(locale, { maximumFractionDigits: 0 })
}

/** Tiny stat cell used in widget footers. */
function StatCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="min-w-0 flex-1">
			<div className="truncate font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted-foreground/60">
				{label}
			</div>
			<div
				className={cn(
					'mt-0.5 truncate font-mono text-[11px] font-semibold tabular-nums',
					accent ? 'text-[#209CE9]' : 'text-foreground',
				)}
			>
				{value}
			</div>
		</div>
	)
}

function Delta({ label, value, emphasized = false }: { label: string; value: number | null; emphasized?: boolean }) {
	const positive = value !== null && value > 0
	const negative = value !== null && value < 0
	return (
		<span className={cn('font-mono tabular-nums', emphasized ? 'text-base font-bold' : 'text-[10px]')}>
			<span className={cn('mr-1 uppercase tracking-[0.15em] text-muted-foreground/60', 'text-[8.5px]')}>
				{label}
			</span>
			<span
				className={cn(
					positive && 'text-[#04b16e]',
					negative && 'text-[#ea3943]',
					value === null && 'text-muted-foreground/60',
					!positive && !negative && value !== null && 'text-foreground/80',
				)}
			>
				{value === null ? '—' : formatPercentage(value, { showSign: true })}
			</span>
		</span>
	)
}

export function PriceWidget({
	t,
	params,
	locale,
	marketData,
	fiats,
	cryptos,
}: {
	t: WidgetStrings
	params: WidgetParams
	locale: string
	marketData: MarketDataResponse
	/** Secondary fiat currencies for the strip (primary excluded). */
	fiats: FiatCurrency[]
	/** Picked cryptos the price is also shown in. */
	cryptos: { symbol: string; usdPrice: number }[]
}) {
	const { xnoData } = marketData
	const rate = getFiatRate(params.currency, marketData as ExchangeRates)
	const price = xnoData.current_price * rate
	const key = params.currency.toLowerCase() as 'usd' | 'eur' | 'gbp' | 'jpy' | 'chf' | 'cad' | 'aud'
	const delta1h = marketData.xnoPriceChange1h?.[key] ?? null
	const delta24h = marketData.xnoPriceChange24h?.[key] ?? null
	const delta7d = marketData.xnoPriceChange7d?.[key] ?? null
	const rangeDelta = params.range === '7d' ? delta7d : delta24h
	const supply = xnoData.circulating_supply ?? 0

	return (
		<WidgetFrame label={t.priceLabel} led="cyan" ledPulse height={params.compact ? 178 : 228}>
			<div className="flex items-baseline justify-between gap-3">
				<span className="font-mono text-[28px] font-bold leading-none tracking-tight tabular-nums">
					{formatFiatPrice(price, params.currency, locale)}
				</span>
				<Delta label={params.range === '7d' ? t.delta7d : t.delta24h} value={rangeDelta} emphasized />
			</div>
			{!params.compact && (
				<>
					<div className="mt-2 flex items-center gap-3">
						<Delta label={t.delta1h} value={delta1h} />
						<span aria-hidden="true" className="h-3 w-px bg-border" />
						<Delta label={t.delta24h} value={delta24h} />
						<span aria-hidden="true" className="h-3 w-px bg-border" />
						<Delta label={t.delta7d} value={delta7d} />
					</div>
					<div className="mt-2">
						<SecondaryFiatStrip
							usdValue={xnoData.current_price}
							rates={marketData as ExchangeRates}
							locale={locale}
							fiats={fiats}
							cryptos={cryptos}
						/>
					</div>
					<WidgetDivider />
					<div className="flex gap-3">
						<StatCell
							label={t.capLabel}
							value={formatFiatMarketCap(xnoData.current_price * supply, params.currency)}
							accent
						/>
						<StatCell label={t.supplyLabel} value={`${formatSupply(supply, locale)} XNO`} />
						<StatCell label={t.rankLabel} value={`#${xnoData.market_cap_rank ?? '—'}`} />
					</div>
				</>
			)}
		</WidgetFrame>
	)
}

export function MarketCapWidget({
	t,
	params,
	locale,
	marketData,
	fiats,
	cryptos,
	bitcoinMarketCap,
}: {
	t: WidgetStrings
	params: WidgetParams
	locale: string
	marketData: MarketDataResponse
	fiats: FiatCurrency[]
	cryptos: { symbol: string; usdPrice: number }[]
	bitcoinMarketCap: number | null
}) {
	const { xnoData } = marketData
	const rate = getFiatRate(params.currency, marketData as ExchangeRates)
	const supply = xnoData.circulating_supply ?? 0
	const cap = xnoData.current_price * supply * rate

	if (params.variant === 'btc') {
		const btcCap = (bitcoinMarketCap ?? 0) * rate
		const impliedPrice = btcCap > 0 && supply > 0 ? btcCap / supply : null
		return (
			<WidgetFrame label={t.btcTitle} led="amber" height={params.compact ? 164 : 200}>
				<div className="flex items-baseline justify-between gap-3">
					<span className="font-mono text-[26px] font-bold leading-none tracking-tight tabular-nums">
						{impliedPrice !== null
							? `1 XNO = ${formatFiatPrice(impliedPrice, params.currency, locale)}`
							: '—'}
					</span>
				</div>
				{!params.compact && (
					<>
						<WidgetDivider />
						<div className="flex gap-3">
							<StatCell
								label={t.btcCapLabel}
								value={formatFiatMarketCap(btcCap, params.currency)}
								accent
							/>
							<StatCell label={t.btcSupplyLabel} value={`${formatSupply(supply, locale)} XNO`} />
						</div>
					</>
				)}
			</WidgetFrame>
		)
	}

	const key = params.currency.toLowerCase() as 'usd' | 'eur' | 'gbp' | 'jpy' | 'chf' | 'cad' | 'aud'
	const delta24h = marketData.xnoPriceChange24h?.[key] ?? null
	return (
		<WidgetFrame label={t.capLabel} led="cyan" height={params.compact ? 164 : 214}>
			<div className="flex items-baseline justify-between gap-3">
				<span className="font-mono text-[28px] font-bold leading-none tracking-tight tabular-nums">
					{formatFiatMarketCap(cap, params.currency)}
				</span>
				<Delta label={t.delta24h} value={delta24h} emphasized />
			</div>
			{!params.compact && (
				<>
					<div className="mt-2">
						<SecondaryFiatStrip
							usdValue={xnoData.current_price * supply}
							rates={marketData as ExchangeRates}
							locale={locale}
							variant="cap"
							fiats={fiats}
							cryptos={cryptos}
						/>
					</div>
					<WidgetDivider />
					<div className="flex gap-3">
						<StatCell
							label={t.priceLabel}
							value={formatFiatPrice(xnoData.current_price * rate, params.currency, locale)}
							accent
						/>
						<StatCell label={t.supplyLabel} value={`${formatSupply(supply, locale)} XNO`} />
						<StatCell label={t.rankLabel} value={`#${xnoData.market_cap_rank ?? '—'}`} />
					</div>
				</>
			)}
		</WidgetFrame>
	)
}
