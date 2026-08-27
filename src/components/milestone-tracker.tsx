'use client'

import { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { primaryFiatAtom } from '@/lib/currency-atoms'
import {
	type ExchangeRates,
	formatFiatMarketCap,
	formatFiatPrice,
	formatPercentage,
	getFiatRate,
} from '@/lib/currency-helpers'
import { MILESTONES_BY_CURRENCY, niceStep, shortCap } from '@/lib/milestones'
import { cn } from '@/lib/utils'

import { useMarketData } from '@/hooks/use-market-data'

import { PrimaryCurrencySelect } from '@/components/primary-currency-select'

const TRACK_TICKS: React.CSSProperties = {
	backgroundImage: 'repeating-linear-gradient(90deg, oklch(0.96 0.005 260 / 0.22) 0 1px, transparent 1px 10%)',
}

/** Animate a value toward a target with cubic ease-out; jumps when reduced motion is preferred. */
export function useAnimatedCap(target: number): number {
	const [value, setValue] = useState(0)
	const fromRef = useRef(0)
	const rafRef = useRef<number>(0)

	useEffect(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const from = fromRef.current
		if (prefersReduced || from === target) {
			setValue(target)
			return
		}
		const duration = 1100
		const start = performance.now()
		const tick = (now: number) => {
			const progress = Math.min(1, (now - start) / duration)
			const eased = 1 - (1 - progress) ** 3
			setValue(from + (target - from) * eased)
			if (progress < 1) {
				rafRef.current = requestAnimationFrame(tick)
			} else {
				fromRef.current = target
			}
		}
		rafRef.current = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(rafRef.current)
	}, [target])

	return value
}

export function MilestoneTracker() {
	const t = useTranslations('home')
	const [primaryFiat] = useAtom(primaryFiatAtom)
	const {
		xnoData,
		xnoCirculatingSupply,
		xnoPriceChange24h,
		xnoPriceChange7d,
		eurRate,
		gbpRate,
		jpyRate,
		chfRate,
		cadRate,
		audRate,
	} = useMarketData()

	// Display everything in the selected primary fiat (USD canonical upstream)
	const rates: ExchangeRates = { eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
	const fiatRate = getFiatRate(primaryFiat, rates)

	// Hover position over the gauge (px, plus the track width for clamping)
	const [hover, setHover] = useState<{ x: number; width: number } | null>(null)
	const trackRef = useRef<HTMLDivElement>(null)

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const el = trackRef.current
		if (!el) return
		const rect = el.getBoundingClientRect()
		if (rect.width <= 0) return
		const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * rect.width
		setHover({ x, width: rect.width })
	}

	// Market cap in USD (canonical upstream); guarded so the tracker can render standalone
	const marketCapUSD = xnoData ? xnoCirculatingSupply * xnoData.current_price : 0
	const displayedCap = useAnimatedCap(marketCapUSD)

	if (!xnoData || !Number.isFinite(marketCapUSD) || marketCapUSD <= 0) {
		return null
	}

	// Everything below works in the selected currency space against its native
	// milestone ladder, so targets are always round numbers in the displayed unit.
	const capCur = marketCapUSD * fiatRate
	const milestones = MILESTONES_BY_CURRENCY[primaryFiat]
	const prev = milestones.filter((milestone) => milestone <= capCur).at(-1) ?? 0
	const next = milestones.find((milestone) => milestone > capCur) ?? prev * 2
	const progress = next > prev ? Math.min(1, Math.max(0, (capCur - prev) / (next - prev))) : 1
	const progressPct = (progress * 100).toFixed(1)

	// Tick ladder between prev and next at a nice step (skip the origin tick)
	const step = niceStep(next - prev)
	const ticks: number[] = []
	for (let tick = Math.ceil(prev / step) * step; tick <= next; tick += step) {
		if (tick > 0) ticks.push(tick)
	}
	const tickLeft = (tick: number) => ((tick - prev) / (next - prev)) * 100

	const toNext = next - capCur
	const changes = [
		{ label: '24H', value: xnoPriceChange24h?.usd ?? 0 },
		{ label: '7D', value: xnoPriceChange7d?.usd ?? 0 },
	]

	// Hover tooltip: implied market cap + XNO price at the hovered position
	const hoverFraction = hover && hover.width > 0 ? hover.x / hover.width : 0
	const hoverCap = prev + hoverFraction * (next - prev)
	const hoverPrice = hoverCap / xnoCirculatingSupply
	const TOOLTIP_HALF = 112
	const tooltipLeft =
		hover !== null
			? Math.min(Math.max(hover.x, TOOLTIP_HALF), Math.max(hover.width - TOOLTIP_HALF, TOOLTIP_HALF))
			: 0

	return (
		<div className="rounded-md border border-border bg-card p-4 sm:p-5">
			{/* Header: label + change chips */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
					{t('milestoneSection')}
				</p>
				<div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
					{changes.map((change) => (
						<span key={change.label} className="flex items-center gap-1.5">
							<span className="text-muted-foreground/70">{change.label}</span>
							<span
								suppressHydrationWarning
								className={cn(
									'flex items-center gap-1 font-semibold tabular-nums',
									change.value >= 0 ? 'text-trendup' : 'text-trenddown',
								)}
							>
								<span aria-hidden="true" className="text-[7px] leading-none">
									{change.value >= 0 ? '▲' : '▼'}
								</span>
								{formatPercentage(change.value)}
							</span>
						</span>
					))}
				</div>
			</div>

			{/* Value row */}
			<div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<p className="font-mono text-3xl font-bold tabular-nums tracking-tight">
					<span suppressHydrationWarning>{formatFiatMarketCap(displayedCap * fiatRate, primaryFiat)}</span>
				</p>
				<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
					{t('milestoneNext')}{' '}
					<span suppressHydrationWarning className="font-bold text-foreground">
						{shortCap(next, primaryFiat)}
					</span>
					<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
						·
					</span>
					{t('milestoneToGo')}{' '}
					<span suppressHydrationWarning className="tabular-nums font-bold text-foreground">
						{shortCap(toNext, primaryFiat)}
					</span>
				</p>
			</div>

			{/* Gauge */}
			<div className="relative mt-4 px-1">
				<div
					ref={trackRef}
					onPointerMove={handlePointerMove}
					onPointerDown={handlePointerMove}
					onPointerLeave={() => setHover(null)}
					className="relative h-3 cursor-crosshair"
				>
					<div className="absolute inset-0 rounded-full bg-muted" />
					<div className="absolute inset-0 overflow-hidden rounded-full">
						<div
							suppressHydrationWarning
							className="h-full bg-linear-to-r from-[#0f6dbd] to-[#209CE9] transition-[width] duration-700 ease-out"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
					<div aria-hidden="true" className="absolute inset-0" style={TRACK_TICKS} />
					{hover !== null && (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-foreground/30"
							style={{ left: `${hover.x}px` }}
						/>
					)}
					<div
						aria-hidden="true"
						suppressHydrationWarning
						className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
						style={{ left: `${progressPct}%` }}
					>
						<span className="block h-5 w-px bg-[#209CE9]" />
						<span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#209CE9] shadow-[0_0_8px_2px_rgba(32,156,233,0.55)]" />
					</div>
				</div>

				{/* Hover tooltip: implied cap + XNO price */}
				{hover !== null && (
					<div
						className="pointer-events-none absolute bottom-full left-0 z-20 -translate-y-2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-lg"
						style={{ left: `${tooltipLeft}px` }}
					>
						<p className="flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
							<span>{t('milestoneTooltipCap')}</span>
							<span suppressHydrationWarning className="tabular-nums text-foreground">
								{formatFiatMarketCap(hoverCap, primaryFiat)}
							</span>
						</p>
						<p className="mt-1 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
							<span>{t('milestoneTooltipXno')}</span>
							<span suppressHydrationWarning className="tabular-nums font-bold text-[#209CE9]">
								≈ {formatFiatPrice(hoverPrice, primaryFiat)}
							</span>
						</p>
						<span
							aria-hidden="true"
							className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-card"
						/>
					</div>
				)}

				<div className="relative mt-1.5 h-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
					{ticks.map((tick) => (
						<span key={tick} className="absolute -translate-x-1/2" style={{ left: `${tickLeft(tick)}%` }}>
							<span suppressHydrationWarning>{shortCap(tick, primaryFiat)}</span>
						</span>
					))}
				</div>
			</div>

			{/* Footer: currency selector / progress / all milestones */}
			<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-3">
				<PrimaryCurrencySelect />
				<p className="font-mono text-lg font-bold tabular-nums tracking-tight text-[#209CE9]">{progressPct}%</p>
				<Link
					href="/milestones"
					className="group flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
				>
					{t('milestoneAll')}
					<span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
						→
					</span>
				</Link>
			</div>
		</div>
	)
}
