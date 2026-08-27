'use client'

import { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { FiatCurrency } from '@/lib/constants'
import { primaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatFiatMarketCap,
	formatFiatPrice,
	getFiatRate,
	getFiatSymbol,
} from '@/lib/currency-helpers'
import { MILESTONE_CURRENCIES, MILESTONES_BY_CURRENCY, milestoneWindow, niceStep, shortCap } from '@/lib/milestones'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { useAnimatedCap } from '@/components/milestone-tracker'
import { PrimaryCurrencySelect } from '@/components/primary-currency-select'

/** Server-resolved editorial hook: $1B story chip, locale-aware href via <Link>. */
export type MilestonesStory = { label: string }

const TRACK_TICKS: React.CSSProperties = {
	backgroundImage: 'repeating-linear-gradient(90deg, oklch(0.96 0.005 260 / 0.22) 0 1px, transparent 1px 10%)',
}

type GaugeHover = { x: number; width: number }

function fracFromEvent(event: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement): number {
	const rect = el.getBoundingClientRect()
	if (rect.width <= 0) return 0
	return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
}

// Scrub fraction is clamped to the window: reaching exactly 1.0 parks the cap
// on the window's next milestone (100%). The window does NOT auto-advance —
// the lock is retained at the boundary; PREVIOUS/NEXT MILESTONE handle it.
const clampScrub = (raw: number) => Math.min(1, Math.max(0, raw))

/**
 * Ladder gauge for one currency: windowed track (prev → next milestone) with
 * labeled ticks, gradient fill, position marker and a hover tooltip showing
 * the implied 1 XNO price at the hovered cap.
 *
 * When draggable (the master gauge) the window is FROZEN during a scrub via
 * windowOverride: the marker slides within the current window and clamps at
 * its edge instead of re-windowing mid-drag. Advancing is explicit (PREVIOUS/
 * NEXT MILESTONE buttons, ladder-row clicks). Non-draggable gauges (panels)
 * always derive their window from the displayed cap, so they evolve through
 * their own milestones as the master scrubs.
 */
function LadderGauge({
	cap,
	currency,
	supply,
	hypothetical,
	onScrub,
	onDragStart,
	onDragEnd,
	windowOverride,
	ghostCap,
	compact,
	capLabel,
	priceLabel,
}: {
	cap: number
	currency: FiatCurrency
	supply: number
	hypothetical: boolean
	onScrub?: (fraction: number) => void
	onDragStart?: () => void
	onDragEnd?: () => void
	windowOverride?: { prev: number; next: number }
	ghostCap?: number | null
	compact?: boolean
	capLabel: string
	priceLabel: string
}) {
	const [hover, setHover] = useState<GaugeHover | null>(null)
	const [dragging, setDragging] = useState(false)
	const trackRef = useRef<HTMLDivElement>(null)

	const ladder = MILESTONES_BY_CURRENCY[currency]
	const window = windowOverride ?? milestoneWindow(ladder, cap)
	const { prev, next } = window
	const fraction = next > prev ? Math.min(1, Math.max(0, (cap - prev) / (next - prev))) : 1
	const fractionPct = (fraction * 100).toFixed(1)

	// Tick ladder inside the window at a nice step (skip the origin tick)
	const step = niceStep(next - prev)
	const ticks: number[] = []
	for (let tick = Math.ceil(prev / step) * step; tick <= next; tick += step) {
		if (tick > 0) ticks.push(tick)
	}
	const tickLeft = (tick: number) => ((tick - prev) / (next - prev)) * 100

	const ghostFraction =
		ghostCap !== undefined && ghostCap !== null && ghostCap > 0 && next > prev
			? Math.min(1, Math.max(0, (ghostCap - prev) / (next - prev)))
			: null

	// Hover tooltip values
	const hoverFraction = hover && hover.width > 0 ? hover.x / hover.width : 0
	const hoverCap = prev + hoverFraction * (next - prev)
	const TOOLTIP_HALF = 112
	const tooltipLeft =
		hover !== null
			? Math.min(Math.max(hover.x, TOOLTIP_HALF), Math.max(hover.width - TOOLTIP_HALF, TOOLTIP_HALF))
			: 0

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const el = trackRef.current
		if (!el) return
		const rect = el.getBoundingClientRect()
		if (rect.width <= 0) return
		const frac = fracFromEvent(event, el)
		if (dragging && onScrub) {
			onScrub(clampScrub(frac))
			return
		}
		setHover({ x: frac * rect.width, width: rect.width })
	}

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!onScrub) return
		const el = trackRef.current
		if (!el) return
		el.setPointerCapture(event.pointerId)
		setDragging(true)
		onDragStart?.()
		onScrub(clampScrub(fracFromEvent(event, el)))
	}

	const handlePointerUp = () => {
		if (!dragging) return
		setDragging(false)
		onDragEnd?.()
	}

	return (
		<div className={cn('relative', compact ? 'mt-3' : 'mt-4')}>
			<div className="px-1">
				<div
					ref={trackRef}
					onPointerMove={handlePointerMove}
					onPointerDown={handlePointerDown}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					onPointerLeave={() => {
						setHover(null)
						if (!onScrub) setDragging(false)
					}}
					className={cn(
						'relative cursor-crosshair',
						compact ? 'h-2' : 'h-3',
						onScrub && 'touch-none select-none',
					)}
				>
					<div className="absolute inset-0 rounded-full bg-muted" />
					<div className="absolute inset-0 overflow-hidden rounded-full">
						<div
							suppressHydrationWarning
							className={cn(
								'h-full bg-linear-to-r from-[#0f6dbd] to-[#209CE9]',
								dragging ? 'transition-none' : 'transition-[width] duration-500 ease-out',
							)}
							style={{ width: `${fractionPct}%` }}
						/>
					</div>
					<div aria-hidden="true" className="absolute inset-0" style={TRACK_TICKS} />

					{hover !== null && !dragging && (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-foreground/30"
							style={{ left: `${hover.x}px` }}
						/>
					)}
					{ghostFraction !== null && (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-amber-400/60"
							style={{ left: `${ghostFraction * 100}%` }}
						/>
					)}

					{/* Position marker: solid blue for real, dashed amber for hypothetical */}
					<div
						aria-hidden="true"
						suppressHydrationWarning
						className={cn(
							'absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2',
							dragging ? 'transition-none' : 'transition-[left] duration-500 ease-out',
						)}
						style={{ left: `${fractionPct}%` }}
					>
						<span
							className={cn(
								'block w-px',
								compact ? 'h-3.5' : 'h-5',
								hypothetical ? 'border-l border-dashed border-amber-400' : 'bg-[#209CE9]',
							)}
						/>
						<span
							className={cn(
								'absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
								hypothetical
									? 'bg-amber-400 shadow-[0_0_8px_2px_rgba(245,158,11,0.5)]'
									: 'bg-[#209CE9] shadow-[0_0_8px_2px_rgba(32,156,233,0.55)]',
							)}
						/>
					</div>
				</div>

				<div className="relative mt-1.5 h-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
					{ticks.map((tick) => (
						<span key={tick} className="absolute -translate-x-1/2" style={{ left: `${tickLeft(tick)}%` }}>
							<span suppressHydrationWarning>{shortCap(tick, currency)}</span>
						</span>
					))}
				</div>
			</div>

			{hover !== null && !dragging && (
				<div
					className="pointer-events-none absolute bottom-full left-0 z-20 -translate-y-2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-lg"
					style={{ left: `${tooltipLeft}px` }}
				>
					<p className="flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
						<span>{capLabel}</span>
						<span suppressHydrationWarning className="tabular-nums text-foreground">
							{formatFiatMarketCap(hoverCap, currency)}
						</span>
					</p>
					<p className="mt-1 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
						<span>{priceLabel}</span>
						<span suppressHydrationWarning className="tabular-nums font-bold text-[#209CE9]">
							≈ {formatFiatPrice(hoverCap / supply, currency)}
						</span>
					</p>
					<span
						aria-hidden="true"
						className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-card"
					/>
				</div>
			)}
		</div>
	)
}

export function MilestonesView({ story }: { story?: MilestonesStory }) {
	const t = useTranslations('milestones')
	const { xnoData, xnoCirculatingSupply, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate } = useMarketData()

	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
	const marketCapUSD = xnoData ? xnoCirculatingSupply * xnoData.current_price : 0
	const animatedUSD = useAnimatedCap(marketCapUSD)

	const [hypoUSD, setHypoUSD] = useState<number | null>(null)
	const [ghostPanels, setGhostPanels] = useState<Record<string, number | null>>({})
	// Only the master window freezes at drag start (sliding clamps at its edge
	// instead of re-windowing). The currency panels are readouts: they keep
	// evolving through their own milestones as the hypothetical cap moves.
	const [masterLock, setMasterLock] = useState<{ prev: number; next: number } | null>(null)
	const [primaryFiat] = useAtom(primaryFiatAtom)
	// atomWithStorage reads localStorage synchronously on the FIRST client
	// render, so during hydration the atom may already hold a stored currency
	// while the server rendered the default (USD). Any currency-dependent UI
	// must render the server value until mount: the panel grid, master label
	// and all values are structural, so suppressHydrationWarning can't save it.
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	const activeFiat = mounted ? primaryFiat : FiatCurrency.USD

	if (!xnoData || !Number.isFinite(marketCapUSD) || marketCapUSD <= 0) {
		return null
	}

	const supply = xnoCirculatingSupply
	const displayUSD = hypoUSD ?? animatedUSD
	const isHypo = hypoUSD !== null

	// The master gauge displays the PRIMARY fiat currency (native ladder and
	// values); hypothetical position is stored in USD so it survives currency
	// switches. Panels show every other currency.
	const primaryRate = getFiatRate(activeFiat, rates)
	const masterCap = displayUSD * primaryRate
	const masterLadder = MILESTONES_BY_CURRENCY[activeFiat]

	// The window (and everything derived from it: buttons, readouts) is based on
	// the REAL cap (or the hypothetical simulation) — NOT the animated count-up
	// value, which starts at 0 during hydration. The dehydrated market data is
	// identical on server and client, so the button `disabled` states can never
	// diverge and trigger a hydration mismatch. The animated value only drives
	// the displayed number and the marker position inside the window.
	const windowBaseCap = (hypoUSD ?? marketCapUSD) * primaryRate
	const masterWindow = milestoneWindow(masterLadder, windowBaseCap)
	const masterPrice = masterCap / supply
	const panels = MILESTONE_CURRENCIES.filter((currency) => currency !== activeFiat)

	const scrubMaster = (usdCap: number) => {
		const maxPrimary = masterLadder.at(-1) ?? 5e13
		setHypoUSD(Math.min(Math.max(usdCap, 1e6), maxPrimary / primaryRate))
	}

	const lockMaster = () => {
		// Re-locking from a retained boundary lock keeps the same window so a
		// second drag continues where the previous one ended.
		setMasterLock(masterLock ?? milestoneWindow(masterLadder, windowBaseCap))
	}

	const unlockMaster = () => {
		// When parked exactly on the window's next milestone (100%), retain the
		// lock: the gauge shows a full bar instead of auto-advancing the window.
		// Advancing is the buttons' job (they target the window's top/bottom).
		const boundaryUSD = masterLock ? masterLock.next / primaryRate : null
		if (hypoUSD !== null && boundaryUSD !== null && Math.abs(hypoUSD - boundaryUSD) < 1e-9) {
			return
		}
		setMasterLock(null)
	}

	// The master scrub maps a fraction into the FROZEN window when dragging,
	// the derived window otherwise. The window is in primary-currency units, so
	// the resulting cap is converted back to USD for storage.
	const masterScrubWindow = masterLock ?? masterWindow

	// PREVIOUS/NEXT MILESTONE targets are only computed after mount. The market
	// data backing the window can differ between the server page render and the
	// dehydrated layout state (cached layout vs fresh page fetch), so deriving
	// `disabled` from it at hydration is not safe — React refuses to patch a
	// disabled flip. Both buttons render disabled during hydration, then enable
	// from the client's own data a tick after mount.
	//
	// Targets are computed from the DISPLAYED window (masterScrubWindow):
	// PREVIOUS lands on the ladder entry below the window start (0 when the
	// window starts at the first entry), NEXT lands on the window's top — which
	// from a 100% state re-derives the window above at 0%.
	const prevTarget = mounted
		? masterScrubWindow.prev > 0
			? (() => {
					const idx = masterLadder.indexOf(masterScrubWindow.prev)
					return idx > 0 ? masterLadder[idx - 1] : 0
				})()
			: null
		: null

	// NEXT MILESTONE targets the window above; null at the ladder top.
	const nextTarget = mounted && masterScrubWindow.next < (masterLadder.at(-1) ?? 0) ? masterScrubWindow.next : null

	return (
		<div className="space-y-4">
			{/* ============ MASTER INSTRUMENT ============ */}
			<div className="animate-fade-in-up rounded-md border border-border bg-card p-4 sm:p-5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('masterLabel')}
						<span className="ml-2 font-bold text-[#209CE9]">{activeFiat}</span>
					</p>
					<div className="flex flex-wrap items-center gap-2">
						<PrimaryCurrencySelect />
						{isHypo && (
							<span className="rounded-sm border border-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-400">
								{t('hypothetical')}
							</span>
						)}
						<button
							type="button"
							onClick={() => {
								if (prevTarget !== null) {
									// Button jumps leave the current window: they land on an
									// adjacent milestone, which re-derives the window from the cap.
									setMasterLock(null)
									scrubMaster(prevTarget / primaryRate)
								}
							}}
							disabled={prevTarget === null}
							suppressHydrationWarning
							className="cursor-pointer rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
						>
							{t('jumpPrev')}
						</button>
						<button
							type="button"
							onClick={() => {
								if (nextTarget !== null) {
									setMasterLock(null)
									scrubMaster(nextTarget / primaryRate)
								}
							}}
							disabled={nextTarget === null}
							suppressHydrationWarning
							className="cursor-pointer rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
						>
							{t('jumpNext')}
						</button>
						<button
							type="button"
							onClick={() => {
								setHypoUSD(null)
								setMasterLock(null)
							}}
							className="cursor-pointer rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
						>
							{t('current')}
						</button>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<p
						className={cn(
							'font-mono text-3xl font-bold tabular-nums tracking-tight sm:text-4xl',
							isHypo && 'text-amber-400',
						)}
					>
						<span suppressHydrationWarning>{formatFiatMarketCap(masterCap, activeFiat)}</span>
					</p>
					<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
						{t('xnoPrice')}{' '}
						<span
							suppressHydrationWarning
							className={cn('font-bold tabular-nums', isHypo ? 'text-amber-400' : 'text-foreground')}
						>
							≈ {formatFiatPrice(masterPrice, activeFiat)}
						</span>
					</p>
				</div>

				<LadderGauge
					cap={masterCap}
					currency={activeFiat}
					supply={supply}
					hypothetical={isHypo}
					onScrub={(fraction) => {
						const capPrimary =
							masterScrubWindow.prev + fraction * (masterScrubWindow.next - masterScrubWindow.prev)
						scrubMaster(capPrimary / primaryRate)
					}}
					onDragStart={lockMaster}
					onDragEnd={unlockMaster}
					windowOverride={masterLock ?? undefined}
					capLabel={t('tooltipCap')}
					priceLabel={t('xnoPrice')}
				/>

				<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-3">
					<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{t('next')}{' '}
						<span suppressHydrationWarning className="font-bold text-foreground">
							{shortCap(masterWindow.next, activeFiat)}
						</span>
						<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
							·
						</span>
						<span
							suppressHydrationWarning
							className={cn('font-bold tabular-nums', isHypo ? 'text-amber-400' : 'text-[#209CE9]')}
						>
							{(masterWindow.progress * 100).toFixed(1)}%
						</span>
						<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
							·
						</span>
						{t('toGo')}{' '}
						<span suppressHydrationWarning className="font-bold tabular-nums text-foreground">
							{shortCap(masterWindow.next - masterCap, activeFiat)}
						</span>
					</p>
					<p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/90">{t('dragHint')}</p>
				</div>
			</div>

			{/* ============ CURRENCY INSTRUMENTS ============ */}
			<div
				className="grid animate-fade-in-up gap-4 sm:grid-cols-2 xl:grid-cols-3"
				style={{ animationDelay: '80ms' }}
			>
				{panels.map((currency) => {
					const rate = getFiatRate(currency, rates)
					const cap = displayUSD * rate
					const ladder = MILESTONES_BY_CURRENCY[currency]
					const { next, progress } = milestoneWindow(ladder, cap)
					const upcoming = ladder.filter((milestone) => milestone > cap).slice(0, 3)
					const ghost = ghostPanels[currency] ?? null

					return (
						<div key={currency} className="flex flex-col rounded-md border border-border bg-card p-4">
							<div className="flex items-baseline justify-between gap-3">
								<p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
									{currency}
									<span className="ml-1.5 text-[#209CE9]">{getFiatSymbol(currency)}</span>
								</p>
								<p
									suppressHydrationWarning
									className={cn(
										'font-mono text-sm font-bold tabular-nums tracking-tight',
										isHypo ? 'text-amber-400' : 'text-muted-foreground',
									)}
								>
									{formatFiatMarketCap(cap, currency)}
								</p>
							</div>

							<LadderGauge
								cap={cap}
								currency={currency}
								supply={supply}
								hypothetical={isHypo}
								ghostCap={ghost}
								compact
								capLabel={t('tooltipCap')}
								priceLabel={t('xnoPrice')}
							/>

							{/* Live XNO value in this currency: follows the master gauge */}
							<p className="mt-2.5 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
								<span>{t('xnoPrice')}</span>
								<span
									suppressHydrationWarning
									className={cn(
										'font-bold tabular-nums',
										isHypo ? 'text-amber-400' : 'text-[#209CE9]',
									)}
								>
									≈ {formatFiatPrice(cap / supply, currency)}
								</span>
							</p>

							<p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
								{t('next')}{' '}
								<span suppressHydrationWarning className="font-bold text-foreground">
									{shortCap(next, currency)}
								</span>
								<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
									·
								</span>
								<span
									suppressHydrationWarning
									className={cn(
										'font-bold tabular-nums',
										isHypo ? 'text-amber-400' : 'text-[#209CE9]',
									)}
								>
									{(progress * 100).toFixed(1)}%
								</span>
								<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
									·
								</span>
								{t('toGo')}{' '}
								<span suppressHydrationWarning className="font-bold tabular-nums text-foreground">
									{shortCap(next - cap, currency)}
								</span>
							</p>

							<div className="mt-2 border-t border-dashed border-border pt-2">
								<p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
									{t('ladder')}
								</p>
								<ul className="space-y-0.5">
									{upcoming.map((milestone) => (
										<li key={milestone}>
											<button
												type="button"
												onClick={() => scrubMaster(milestone / rate)}
												onMouseEnter={() =>
													setGhostPanels((prev) => ({ ...prev, [currency]: milestone }))
												}
												onMouseLeave={() =>
													setGhostPanels((prev) => ({ ...prev, [currency]: null }))
												}
												className="group flex w-full cursor-pointer items-baseline justify-between gap-2 rounded-sm px-1.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
											>
												<span suppressHydrationWarning className="flex items-center gap-1.5">
													<span
														aria-hidden="true"
														className="text-[8px] opacity-0 transition-opacity group-hover:opacity-100"
													>
														→
													</span>
													{shortCap(milestone, currency)}
												</span>
												<span
													suppressHydrationWarning
													className="tabular-nums text-foreground/70 group-hover:text-[#209CE9]"
												>
													≈ {formatFiatPrice(milestone / supply, currency)}
												</span>
											</button>
										</li>
									))}
								</ul>
							</div>
						</div>
					)
				})}
			</div>

			{/* ============ FOOTER ============ */}
			<div
				className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-4"
				style={{ animationDelay: '160ms' }}
			>
				<p
					suppressHydrationWarning
					className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
				>
					{t('supplyNote', { supply: `${(supply / 1e6).toFixed(2)}M` })}
				</p>
				{story && (
					<Link
						href="/news/xno-one-billion-market-cap"
						title={story.label}
						className="group flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
					>
						{t('storyLabel')}
						<span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
							→
						</span>
					</Link>
				)}
			</div>
		</div>
	)
}
