'use client'

import { useMemo, useState } from 'react'
import { Plus, RotateCcw, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { COMPARE_COIN_LIMIT, DEFAULT_COMPARE_SYMBOLS } from '@/lib/compare-cookies'
import type { CompareRates } from '@/lib/market-data-service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')

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

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return rates.coins.filter(
			(coin) => q === '' || coin.symbol.toLowerCase().includes(q) || coin.name.toLowerCase().includes(q),
		)
	}, [rates.coins, query])

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
					<div className="relative">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setOpen((value) => !value)}
							disabled={pins.length >= COMPARE_COIN_LIMIT}
							className="cursor-pointer"
							aria-expanded={open}
						>
							<Plus className="h-3.5 w-3.5" />
							{t('addCoins')}
							<span className="text-muted-foreground tabular-nums">
								{pins.length}/{COMPARE_COIN_LIMIT}
							</span>
						</Button>
						{open && (
							<>
								<button
									type="button"
									aria-label="Close"
									className="fixed inset-0 z-30 cursor-default"
									onClick={() => setOpen(false)}
								/>
								<div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
									<div className="border-b border-border p-2">
										<Input
											value={query}
											onChange={(event) => setQuery(event.target.value)}
											placeholder={t('searchCoins')}
											className="h-8 font-mono text-xs"
											autoFocus
										/>
									</div>
									<ul className="max-h-64 overflow-y-auto">
										{filtered.length === 0 && (
											<li className="px-3 py-3 text-center text-xs text-muted-foreground">
												{t('noMatch')}
											</li>
										)}
										{filtered.map((coin) => {
											const pinned = pins.includes(coin.symbol)
											return (
												<li key={coin.id}>
													<button
														type="button"
														onClick={() => toggle(coin.symbol)}
														disabled={!pinned && pins.length >= COMPARE_COIN_LIMIT}
														className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-40 ${pinned ? 'bg-primary/5' : ''}`}
													>
														<span
															className={`h-3.5 w-3.5 flex-none rounded-[3px] border ${
																pinned ? 'border-primary bg-primary' : 'border-border'
															}`}
															aria-hidden="true"
														>
															{pinned && (
																<span className="block text-[10px] leading-3 text-primary-foreground">
																	✓
																</span>
															)}
														</span>
														<span className="w-14 flex-none font-mono text-xs font-semibold">
															{coin.symbol}
														</span>
														<span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
															{coin.name}
														</span>
														<span className="flex-none font-mono text-[10px] text-muted-foreground/60 tabular-nums">
															#{coin.marketCapRank}
														</span>
													</button>
												</li>
											)
										})}
									</ul>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}
