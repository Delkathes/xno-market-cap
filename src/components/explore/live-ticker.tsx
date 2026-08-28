'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

import { useNetworkConfirmations } from '@/hooks/use-network-confirmations'

const CORNERS = [
	'left-0 top-0 border-l-2 border-t-2',
	'right-0 top-0 border-r-2 border-t-2',
	'bottom-0 left-0 border-b-2 border-l-2',
	'bottom-0 right-0 border-b-2 border-r-2',
] as const

function RegistrationMarks() {
	return (
		<>
			{CORNERS.map((position) => (
				<span
					key={position}
					aria-hidden="true"
					className={`pointer-events-none absolute h-2.5 w-2.5 border-primary/50 ${position}`}
				/>
			))}
		</>
	)
}

function shortenHash(hash: string): string {
	return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}

function shortenAddress(address: string): string {
	return `${address.slice(0, 14)}…${address.slice(-6)}`
}

function formatAmount(xno: number, locale: string): string {
	if (xno >= 1_000_000) {
		return `${(xno / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
	}
	if (xno >= 1) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 2 })
	}
	if (xno > 0) {
		return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
	}
	return '0'
}

/**
 * Live network feed: every confirmed block on the Nano network streams in
 * via WebSocket. Rows are compact instrument entries linking to the block
 * and account pages; the feed caps at 12 and drops off the top.
 */
export function LiveTicker({ locale }: { locale: string }) {
	const t = useTranslations('explore')
	const { confirmations, status } = useNetworkConfirmations()
	const [now, setNow] = useState<number | null>(null)

	// Keep the relative timestamps ticking.
	useEffect(() => {
		setNow(Date.now())
		const id = setInterval(() => setNow(Date.now()), 15_000)
		return () => clearInterval(id)
	}, [])

	const timeAgo = (timestamp: number): string => {
		if (now === null) return ''
		const diffMs = now - timestamp * 1000
		if (diffMs < 0) return t('justNow')
		const minutes = Math.floor(diffMs / 60_000)
		if (minutes < 1) return t('justNow')
		if (minutes < 60) return t('mAgo', { n: minutes })
		const hours = Math.floor(minutes / 60)
		if (hours < 24) return t('hAgo', { n: hours })
		const days = Math.floor(hours / 24)
		return t('dAgo', { n: days })
	}

	return (
		<section className="relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card/60 backdrop-blur-sm">
			<RegistrationMarks />

			<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
				<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					<span
						className={cn(
							'h-1.5 w-1.5 flex-none rounded-full',
							status === 'live'
								? 'animate-live-pulse bg-constructive'
								: status === 'connecting'
									? 'animate-pulse bg-amber-500'
									: 'bg-muted-foreground/40',
						)}
					/>
					{t('feedTitle')}
				</div>
				<span
					className={cn(
						'flex-none font-mono text-[10px] uppercase tracking-[0.2em]',
						status === 'live'
							? 'text-constructive'
							: status === 'connecting'
								? 'text-amber-500'
								: 'text-muted-foreground',
					)}
				>
					{status === 'live' ? t('live') : status === 'connecting' ? t('connecting') : t('offline')}
				</span>
			</div>

			<div className="feed-scroll h-96 overflow-y-auto">
				{confirmations.length === 0 ? (
					<div className="flex h-full items-center justify-center px-4">
						<p className="text-center font-mono text-xs text-muted-foreground">{t('waiting')}</p>
					</div>
				) : (
					<ul className="divide-y divide-border">
						{confirmations.map((entry) => {
							const isSend = entry.subtype === 'send'
							const isReceive = entry.subtype === 'receive' || entry.subtype === 'open'
							return (
								<li
									key={entry.hash}
									className="animate-row-in grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-2.5 transition-colors hover:bg-muted/30"
								>
									<span
										className={cn(
											'flex h-5 w-5 flex-none items-center justify-center rounded-[3px] font-mono text-[10px] leading-none',
											isReceive
												? 'bg-constructive/15 text-constructive'
												: isSend
													? 'bg-destructive/10 text-destructive'
													: 'bg-muted text-muted-foreground',
										)}
										aria-hidden="true"
									>
										{isReceive ? '▲' : isSend ? '▼' : '◆'}
									</span>
									<span className="min-w-0">
										<span className="block truncate font-mono text-sm tabular-nums">
											<span
												className={
													isReceive
														? 'text-constructive'
														: isSend
															? 'text-destructive'
															: 'text-foreground'
												}
											>
												{isReceive ? '+' : isSend ? '-' : ''}
												{formatAmount(entry.amountXno, locale)}
											</span>{' '}
											<span className="text-xs text-muted-foreground">XNO</span>
										</span>
										<Link
											href={`/account/${entry.account}`}
											className="block truncate font-mono text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
										>
											{shortenAddress(entry.account)}
										</Link>
									</span>
									<span className="flex flex-none flex-col items-end gap-0.5">
										<span className="font-mono text-[11px] tabular-nums text-muted-foreground">
											{timeAgo(entry.timestamp)}
										</span>
										<Link
											href={`/block/${entry.hash}`}
											className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary transition-colors hover:text-primary/70"
										>
											{shortenHash(entry.hash)}
										</Link>
									</span>
								</li>
							)
						})}
					</ul>
				)}
			</div>
		</section>
	)
}
