import type { AccountData } from '@/lib/account-data-service'
import type { FiatCurrency } from '@/lib/constants'
import { type ExchangeRates, formatFiatPrice, getFiatRate } from '@/lib/currency-helpers'
import { cn } from '@/lib/utils'

import { SecondaryFiatStrip } from '@/components/widgets/secondary-fiat-strip'
import { WidgetDivider, WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetStrings } from '@/components/widgets/widget-registry'

function formatXno(xno: number, locale: string): string {
	if (xno >= 1_000_000) return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	if (xno >= 1) return xno.toLocaleString(locale, { maximumFractionDigits: 2 })
	return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="flex-none font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
				{label}
			</span>
			<span
				className={cn(
					'min-w-0 break-all text-right font-mono text-[12px] font-semibold tabular-nums',
					accent ? 'text-[#209CE9]' : 'text-foreground',
				)}
			>
				{value}
			</span>
		</div>
	)
}

/** Balance card for any Nano address. Purely public ledger data. */
export function AccountWidget({
	t,
	data,
	priceUsd,
	rates,
	currency,
	locale,
	fiats,
	cryptos,
	compact,
}: {
	t: WidgetStrings
	data: AccountData
	priceUsd: number
	rates: ExchangeRates
	currency: FiatCurrency
	locale: string
	/** Secondary fiat currencies for the strip (primary excluded). */
	fiats: FiatCurrency[]
	/** Picked cryptos the balance is also shown in. */
	cryptos: { symbol: string; usdPrice: number }[]
	compact: boolean
}) {
	const usdValue = data.balanceXno * priceUsd
	const fiatPrimary = usdValue * getFiatRate(currency, rates)

	return (
		<WidgetFrame label={t.typeAccount} led="cyan" fullHeight={246} compactHeight={196}>
			<div className="flex items-start justify-between gap-3">
				<span className="min-w-0 break-all font-mono text-[10px] leading-snug tracking-tight text-foreground">
					{data.address}
				</span>
				<span className="flex-none font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
					{data.hasActivity ? `${data.blockCount.toLocaleString(locale)} ${t.transactionsLabel}` : '—'}
				</span>
			</div>
			<div className="mt-1 flex items-baseline justify-between gap-3">
				<span className="min-w-0 whitespace-nowrap font-mono text-[24px] font-bold leading-none tracking-tight tabular-nums @max-[380px]:text-[18px]">
					{formatXno(data.balanceXno, locale)}{' '}
					<span className="text-[13px] font-semibold text-[#209CE9]">XNO</span>
				</span>
				{priceUsd > 0 && (
					<span className="flex-none font-mono text-[10px] tabular-nums text-muted-foreground">
						≈ {formatFiatPrice(fiatPrimary, currency, locale)}
					</span>
				)}
			</div>
			<div className="@max-[380px]:hidden">
				{!compact && (
					<>
						<div className="mt-2">
							<SecondaryFiatStrip
								usdValue={usdValue}
								rates={rates}
								locale={locale}
								fiats={fiats}
								cryptos={cryptos}
							/>
						</div>
						<WidgetDivider />
						<div className="flex flex-col gap-1.5">
							<Row
								label={t.representativeLabel}
								value={data.representative ? data.representative : '—'}
							/>
							{data.pendingXno > 0 && (
								<Row
									label={t.pendingLabel}
									value={`${formatXno(data.pendingXno, locale)} XNO`}
									accent
								/>
							)}
						</div>
					</>
				)}
			</div>
		</WidgetFrame>
	)
}
