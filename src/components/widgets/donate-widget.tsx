'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { createNanoUri, xnoToRaw } from '@/lib/nano-utils'
import { cn } from '@/lib/utils'

import { WidgetFrame } from '@/components/widgets/widget-frame'
import type { WidgetStrings } from '@/components/widgets/widget-registry'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	ssr: false,
	loading: () => <div className="h-[104px] w-[104px] animate-pulse rounded-sm bg-muted" />,
})

const PRESETS = [1, 5, 10]

function shorten(address: string): string {
	return `${address.slice(0, 12)}…${address.slice(-8)}`
}

/** QR donation card: preset amounts + custom, nano: deep link, permanent
 * attribution. The address is the embedder's own, with no implied endorsement. */
export function DonateWidget({ t, address, compact }: { t: WidgetStrings; address: string; compact: boolean }) {
	const [amount, setAmount] = useState<number | null>(1)

	const raw = useMemo(() => (amount !== null && amount > 0 ? xnoToRaw(amount) : '0'), [amount])
	const uri = useMemo(() => createNanoUri(address, raw), [address, raw])

	return (
		<WidgetFrame label={t.typeDonate} led="amber" height={compact ? 200 : 236}>
			<div className="flex items-start gap-3">
				<div className="rounded-sm border border-border bg-white p-1">
					{uri ? <QRCodeSVG value={uri} size={compact ? 72 : 96} level="M" marginSize={0} /> : null}
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<div className="flex flex-wrap gap-1">
						{PRESETS.map((preset) => (
							<button
								key={preset}
								type="button"
								onClick={() => setAmount(preset)}
								className={cn(
									'cursor-pointer rounded-sm border px-2 py-0.5 font-mono text-[10px] tabular-nums transition-colors',
									amount === preset
										? 'border-amber-400/70 bg-amber-400/10 text-amber-400'
										: 'border-dashed border-border text-muted-foreground hover:border-amber-400/50 hover:text-foreground',
								)}
							>
								{preset} XNO
							</button>
						))}
						<input
							type="text"
							inputMode="decimal"
							value={amount === null ? '' : String(amount)}
							onChange={(event) => {
								const value = Number.parseFloat(event.target.value.replace(',', '.'))
								setAmount(Number.isFinite(value) && value > 0 ? value : null)
							}}
							placeholder={t.donateCustom}
							aria-label={t.donateCustom}
							className="h-6 w-14 rounded-sm border border-dashed border-border bg-muted/30 px-1.5 font-mono text-[10px] tabular-nums outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-amber-400/70"
						/>
					</div>
					<a
						href={uri ?? undefined}
						className="mt-1 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-sm border border-amber-400/60 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-400/20"
					>
						{t.donateCta} ↗
					</a>
					<span className="truncate font-mono text-[9px] tracking-tight text-muted-foreground/70">
						{shorten(address)}
					</span>
					{!compact && (
						<span className="font-mono text-[8.5px] uppercase tracking-[0.15em] text-muted-foreground/50">
							{t.donateTrust}
						</span>
					)}
				</div>
			</div>
		</WidgetFrame>
	)
}
