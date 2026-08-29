'use client'

import { useMemo, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { COMPARE_COIN_LIMIT, DEFAULT_COMPARE_SYMBOLS } from '@/lib/compare-cookies'
import type { CompareRates } from '@/lib/market-data-service'

import { Button } from '@/components/ui/button'
import { CoinPickerDropdown } from '@/components/widgets/coin-picker'

function ratePrecision(rate: number): number {
	if (rate >= 1) return 2
	if (rate >= 0.01) return 4
	if (rate >= 0.0001) return 6
	return 8
}

function formatRate(rate: number, precision: number): string {
	return rate.toLocaleString('en-US', { maximumFractionDigits: precision, minimumFractionDigits: 0 })
}

function formatWalletValue(value: number, locale: string): string {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	}
	if (value >= 1) {
		return value.toLocaleString(locale, { maximumFractionDigits: 2 })
	}
	if (value >= 0.01) {
		return value.toLocaleString(locale, { maximumFractionDigits: 4 })
	}
	if (value >= 0.0001) {
		return value.toLocaleString(locale, { maximumFractionDigits: 6 })
	}
	return value.toLocaleString(locale, { maximumFractionDigits: 8 })
}

export function AccountCompare({
	rates,
	initialPins,
	vsOverride,
	locale,
	balanceXno,
}: {
	rates: CompareRates
	initialPins: string[]
	vsOverride: boolean
	locale: string
	balanceXno: number
}) {
	const t = useTranslations('account')
	const [pins, setPins] = useState<string[]>(initialPins)

	const coinBySymbol = useMemo(() => {
		const map = new Map<string, (typeof rates.coins)[number]>()
		for (const coin of rates.coins) map.set(coin.symbol, coin)
		return map
	}, [rates.coins])

	const persist = (tickers: string[]) => {
		fetch('/api/compare-coins', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tickers }),
		}).catch(() => {
			// Preference save is best effort; the view still works this session.
		})
	}

	const toggle = (symbol: string) => {
		if (pins.includes(symbol)) {
			const next = pins.filter((entry) => entry !== symbol)
			setPins(next)
			persist(next)
		} else if (pins.length < COMPARE_COIN_LIMIT) {
			const next = [...pins, symbol]
			setPins(next)
			persist(next)
		}
	}

	const reset = () => {
		const known = new Set(rates.coins.map((coin) => coin.symbol))
		const defaults = DEFAULT_COMPARE_SYMBOLS.filter((symbol) => known.has(symbol)).slice(0, COMPARE_COIN_LIMIT)
		setPins(defaults)
		persist(defaults)
	}

	return (
		<section className="mt-4">
			{vsOverride && (
				<p className="rounded-sm border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
					{t('vsOverrideNote')}
				</p>
			)}

			{pins.length > 0 && (
				<div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
					{pins.map((symbol) => {
						const coin = coinBySymbol.get(symbol)
						if (!coin) return null
						const precision = ratePrecision(coin.xnoRate)
						return (
							<div key={coin.id} className="relative overflow-hidden bg-card px-3 py-2">
								{coin.image && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={coin.image}
										alt=""
										aria-hidden="true"
										className="pointer-events-none absolute -right-2 -bottom-2 h-12 w-12 flex-none rounded-full opacity-[0.13] dark:opacity-[0.17]"
									/>
								)}
								<div className="relative flex items-center justify-between gap-2">
									<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
										{coin.symbol}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => toggle(symbol)}
										aria-label={`${t('remove')} ${coin.symbol}`}
										className="h-5 w-5 flex-none cursor-pointer text-muted-foreground/40 hover:text-destructive"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
								<div
									className="relative mt-1 font-mono text-sm font-semibold tracking-tight tabular-nums"
									title={coin.name}
								>
									{formatWalletValue(balanceXno * coin.xnoRate, locale)}
								</div>
								<div
									className="relative mt-0.5 font-mono text-[11px] text-muted-foreground/70 tabular-nums"
									title={coin.name}
								>
									1 XNO = {formatRate(coin.xnoRate, precision)}
								</div>
							</div>
						)
					})}
				</div>
			)}

			<div className="mt-3 flex flex-wrap items-center justify-end gap-3">
				<div className="flex items-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={reset} className="cursor-pointer">
						<RotateCcw className="h-3.5 w-3.5" />
						{t('resetToDefault')}
					</Button>
					<CoinPickerDropdown
						coins={rates.coins}
						selected={pins}
						onToggle={toggle}
						limit={COMPARE_COIN_LIMIT}
						searchPlaceholder={t('searchCoins')}
						noMatch={t('noMatch')}
						triggerLabel={(count) => (
							<>
								{t('addCoins')}
								<span className="text-muted-foreground tabular-nums">
									{count}/{COMPARE_COIN_LIMIT}
								</span>
							</>
						)}
					/>
				</div>
			</div>
		</section>
	)
}
