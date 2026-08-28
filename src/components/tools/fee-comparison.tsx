'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import type { BtcFees } from '@/lib/btc-fees'

const TYPICAL_BTC_VBYTES = 226

interface FeeComparisonProps {
	fees: BtcFees
	xnoUsd: number
	btcUsd: number
}

export function FeeComparison({ fees, xnoUsd, btcUsd }: FeeComparisonProps) {
	const t = useTranslations('tools.feeComparison')
	const [sendAmount, setSendAmount] = useState(100)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const raf = requestAnimationFrame(() => setMounted(true))
		return () => cancelAnimationFrame(raf)
	}, [])

	const tiers = useMemo(() => {
		const entries = [
			{ key: 'fastest' as const, satPerVb: fees.fastestFee },
			{ key: 'halfHour' as const, satPerVb: fees.halfHourFee },
			{ key: 'hour' as const, satPerVb: fees.hourFee },
			{ key: 'economy' as const, satPerVb: fees.economyFee },
		]
		return entries.map((tier) => {
			const feeUsd = (tier.satPerVb * TYPICAL_BTC_VBYTES * btcUsd) / 1e8
			return { ...tier, feeUsd }
		})
	}, [fees, btcUsd])

	const maxFeeUsd = Math.max(...tiers.map((tier) => tier.feeUsd), 0.01)
	const fastest = tiers[0]

	const usd = (value: number): string =>
		value.toLocaleString(undefined, {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})

	const satPerXno = btcUsd > 0 ? (xnoUsd / btcUsd) * 1e8 : 0

	return (
		<div className="space-y-6">
			{/* Head-to-head readouts */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="rounded-md border border-border bg-muted/20 p-4">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('nanoFee')}
					</div>
					<div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums text-constructive">
						{t('nanoFeeValue')}
					</div>
					<div className="mt-1 text-xs text-muted-foreground">{t('nanoFeeNote')}</div>
				</div>
				<div className="rounded-md border border-border bg-muted/20 p-4">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('bitcoinFee')}
					</div>
					<div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums text-destructive">
						{usd(fastest.feeUsd)}
					</div>
					<div className="mt-1 text-xs text-muted-foreground">
						{t('bitcoinFeeNote')} · {fastest.satPerVb} sat/vB {t('perTx')}
					</div>
				</div>
			</div>

			{/* Send amount + fee as share */}
			<div className="rounded-md border border-dashed border-border bg-muted/20 p-4">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="min-w-48 space-y-2">
						<label
							htmlFor="fc-amount"
							className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
						>
							{t('sendAmount')}
						</label>
						<input
							id="fc-amount"
							type="number"
							min="1"
							step="10"
							value={sendAmount}
							onChange={(event) => setSendAmount(Math.max(1, Number(event.target.value) || 1))}
							className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40"
						/>
					</div>
					<div className="text-right">
						<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{t('feeAsPercent')}
						</div>
						<div className="mt-1 text-2xl font-bold tabular-nums text-destructive">
							{sendAmount > 0 ? ((fastest.feeUsd / sendAmount) * 100).toFixed(2) : '0.00'}%
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{usd(fastest.feeUsd)} {t('perTx')}
						</div>
					</div>
				</div>
			</div>

			{/* Tier bars */}
			<div className="space-y-3.5">
				{tiers.map((tier, index) => (
					<div key={tier.key} className="space-y-1.5">
						<div className="flex items-baseline justify-between gap-3">
							<span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
								{t(`tiers.${tier.key}`)}
							</span>
							<span className="text-sm tabular-nums">
								{tier.satPerVb} sat/vB · {usd(tier.feeUsd)}
							</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
							<div
								className="h-full rounded-full bg-linear-to-r from-destructive/60 to-destructive"
								style={{
									width: mounted ? `${Math.max(1, (tier.feeUsd / maxFeeUsd) * 100)}%` : '0%',
									transition: `width 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms`,
								}}
							/>
						</div>
					</div>
				))}
			</div>

			{/* XNO context line */}
			{satPerXno > 0 && (
				<p className="font-mono text-xs text-muted-foreground tabular-nums">
					1 XNO ≈ {satPerXno.toLocaleString(undefined, { maximumFractionDigits: 0 })} sats
				</p>
			)}

			<div className="space-y-1.5">
				<p className="text-xs text-muted-foreground/70">{t('vbytesNote')}</p>
				<p className="text-xs text-muted-foreground/70">{t('sourceNote')}</p>
				<p className="text-xs text-muted-foreground/50">{t('updateNote')}</p>
			</div>
		</div>
	)
}
