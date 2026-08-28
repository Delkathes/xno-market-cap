'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Copy, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { AccountHistoryPage, BlockInfo } from '@/lib/account-data-service'

import type { LiveTransaction } from '@/hooks/use-account-confirmations'

import { Button } from '@/components/ui/button'

interface Entry {
	hash: string
	subtype: string
	counterparty: string
	amountXno: number
	balanceXno: number
	timestamp: number | null
	height: number
	confirmed: boolean
}

export function AccountHistory({
	address,
	locale,
	initialPage,
	liveEntries,
	labels,
}: {
	address: string
	locale: string
	initialPage: AccountHistoryPage
	liveEntries?: LiveTransaction[]
	labels?: Record<string, string>
}) {
	const t = useTranslations('account')
	const [entries, setEntries] = useState<Entry[]>(initialPage.entries)
	const [offset, setOffset] = useState(initialPage.offset)
	const [hasMore, setHasMore] = useState(initialPage.hasMore)
	const [loadingMore, setLoadingMore] = useState(false)
	const [loadFailed, setLoadFailed] = useState(false)
	const [expandedHash, setExpandedHash] = useState<string | null>(null)
	const [blockInfo, setBlockInfo] = useState<Record<string, BlockInfo | 'loading' | 'error'>>({})
	const [copiedHash, setCopiedHash] = useState<string | null>(null)
	const [now, setNow] = useState<number | null>(null)

	useEffect(() => {
		setNow(Date.now())
		const id = setInterval(() => setNow(Date.now()), 60_000)
		return () => clearInterval(id)
	}, [])

	const loadMore = async () => {
		setLoadingMore(true)
		setLoadFailed(false)
		try {
			const response = await fetch(`/api/account-history?address=${encodeURIComponent(address)}&offset=${offset}`)
			if (!response.ok) throw new Error(String(response.status))
			const page = (await response.json()) as AccountHistoryPage
			setEntries((current) => [...current, ...page.entries])
			setOffset(page.offset)
			setHasMore(page.hasMore)
		} catch {
			setLoadFailed(true)
		} finally {
			setLoadingMore(false)
		}
	}

	const toggleBlock = async (hash: string) => {
		if (expandedHash === hash) {
			setExpandedHash(null)
			return
		}
		setExpandedHash(hash)
		if (blockInfo[hash]) return
		setBlockInfo((current) => ({ ...current, [hash]: 'loading' }))
		try {
			const response = await fetch(`/api/block-info?hash=${hash}`)
			if (!response.ok) throw new Error(String(response.status))
			const info = (await response.json()) as BlockInfo
			setBlockInfo((current) => ({ ...current, [hash]: info }))
		} catch {
			setBlockInfo((current) => ({ ...current, [hash]: 'error' }))
		}
	}

	const handleCopy = async (value: string) => {
		try {
			await navigator.clipboard.writeText(value)
			setCopiedHash(value)
			setTimeout(() => setCopiedHash(null), 1500)
		} catch {
			// clipboard unavailable
		}
	}

	const formatTime = useCallback(
		(timestamp: number | null): string => {
			if (timestamp === null) return '·'
			if (now !== null) {
				const diffMs = now - timestamp * 1000
				if (diffMs < 0) return t('justNow')
				const minutes = Math.floor(diffMs / 60_000)
				if (minutes < 1) return t('justNow')
				if (minutes < 60) return t('mAgo', { n: minutes })
				const hours = Math.floor(minutes / 60)
				if (hours < 24) return t('hAgo', { n: hours })
				const days = Math.floor(hours / 24)
				if (days < 30) return t('dAgo', { n: days })
			}
			return new Date(timestamp * 1000).toLocaleDateString(locale, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		},
		[locale, now, t],
	)

	// Merge WebSocket-confirmed transactions on top of the paginated list,
	// de-duplicating against hashes already fetched.
	const mergedEntries: Entry[] = useMemo(() => {
		if (!liveEntries || liveEntries.length === 0) return entries
		const known = new Set(entries.map((entry) => entry.hash))
		const live: Entry[] = liveEntries
			.filter((tx) => !known.has(tx.hash))
			.map((tx) => ({
				hash: tx.hash,
				subtype: tx.subtype,
				counterparty: tx.counterparty,
				amountXno: tx.amountXno,
				balanceXno: 0,
				timestamp: tx.timestamp,
				height: 0,
				confirmed: true,
			}))
		return [...live, ...entries]
	}, [entries, liveEntries])

	return (
		<section>
			<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
				{t('history')}
			</div>

			{mergedEntries.length === 0 ? (
				<p className="mt-4 rounded-sm border border-border bg-muted/10 px-3 py-4 text-center text-sm text-muted-foreground">
					{t('noHistory')}
				</p>
			) : (
				<div className="mt-3 overflow-hidden rounded-sm border border-border">
					<ul className="divide-y divide-border">
						{mergedEntries.map((entry) => {
							const isSend = entry.subtype === 'send'
							const isReceive = entry.subtype === 'receive'
							const isChange = entry.subtype === 'change'
							const expanded = expandedHash === entry.hash
							const info = blockInfo[entry.hash]
							const amountText = formatAmount(entry.amountXno, locale)

							return (
								<li key={entry.hash}>
									<button
										type="button"
										onClick={() => toggleBlock(entry.hash)}
										aria-expanded={expanded}
										className={`grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] ${
											expanded ? 'bg-muted/20' : ''
										}`}
									>
										<span
											className={`flex h-5 w-5 flex-none items-center justify-center rounded-[3px] font-mono text-[10px] leading-none ${
												isReceive
													? 'bg-constructive/15 text-constructive'
													: isSend
														? 'bg-destructive/10 text-destructive'
														: 'bg-muted text-muted-foreground'
											}`}
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
													{amountText}
												</span>{' '}
												<span className="text-xs text-muted-foreground">XNO</span>
											</span>
											<span className="block truncate text-[11px] text-muted-foreground/70">
												{isChange
													? t('change')
													: entry.counterparty
														? isSend
															? t('to', {
																	address: formatCounterparty(
																		entry.counterparty,
																		labels?.[entry.counterparty],
																	),
																})
															: t('from', {
																	address: formatCounterparty(
																		entry.counterparty,
																		labels?.[entry.counterparty],
																	),
																})
														: entry.subtype}
											</span>
										</span>
										<span
											className={`flex-none font-mono text-[11px] tabular-nums ${
												entry.confirmed ? 'text-muted-foreground' : 'text-amber-500'
											}`}
										>
											{formatTime(entry.timestamp)}
											{!entry.confirmed && <span className="ml-1.5">{t('unconfirmed')}</span>}
										</span>
										<ChevronDown
											className={`h-3.5 w-3.5 flex-none text-muted-foreground/50 transition-transform ${
												expanded ? 'rotate-180' : ''
											}`}
										/>
									</button>

									{expanded && (
										<div className="border-t border-border bg-muted/10 px-3 py-3 animate-fade-in">
											{info === 'loading' && (
												<div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
													<Loader2 className="h-3.5 w-3.5 animate-spin" />
													{t('loading')}
												</div>
											)}
											{info === 'error' && (
												<p className="py-1 text-xs text-destructive">{t('loadFailed')}</p>
											)}
											{typeof info === 'object' && info !== null && (
												<div className="space-y-1.5">
													<DetailRow
														label={t('blockHash')}
														value={info.hash}
														copyable
														onCopy={() => handleCopy(info.hash)}
														copied={copiedHash === info.hash}
													/>
													<DetailRow
														label={t('blockType')}
														value={info.subtype || info.hash.slice(0, 8) + '…'}
													/>
													<DetailRow
														label={t('blockHeight')}
														value={info.height > 0 ? String(info.height) : '·'}
													/>
													<DetailRow
														label={t('blockAmount')}
														value={`${formatAmount(info.amountXno, locale)} XNO`}
													/>
													<DetailRow
														label={t('blockBalance')}
														value={`${formatAmount(info.balanceXno, locale)} XNO`}
													/>
													<DetailRow
														label={t('blockTime')}
														value={
															info.timestamp !== null
																? new Date(info.timestamp * 1000).toLocaleString(
																		locale,
																		{
																			dateStyle: 'medium',
																			timeStyle: 'short',
																			timeZone: 'UTC',
																		},
																	)
																: '·'
														}
													/>
													{info.account && (
														<DetailRow label={t('blockAccount')} value={info.account} />
													)}
													{info.representative && (
														<DetailRow
															label={t('blockRepresentative')}
															value={info.representative}
														/>
													)}
													{info.linkAsAccount && (
														<DetailRow label={t('blockLink')} value={info.linkAsAccount} />
													)}
													{info.previous && (
														<DetailRow label={t('blockPrevious')} value={info.previous} />
													)}
												</div>
											)}
										</div>
									)}
								</li>
							)
						})}
					</ul>

					{hasMore && (
						<div className="border-t border-border p-2.5">
							{loadFailed && (
								<p className="mb-2 text-center text-xs text-destructive">{t('loadFailed')}</p>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={loadMore}
								disabled={loadingMore}
								className="w-full cursor-pointer"
							>
								{loadingMore ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<ChevronDown className="h-3.5 w-3.5" />
								)}
								{t('loadMore')}
							</Button>
						</div>
					)}
				</div>
			)}
		</section>
	)
}

function DetailRow({
	label,
	value,
	copyable,
	onCopy,
	copied,
}: {
	label: string
	value: string
	copyable?: boolean
	onCopy?: () => void
	copied?: boolean
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<span className="flex-none font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
				{label}
			</span>
			<span className="flex min-w-0 items-center justify-end gap-1.5 font-mono text-xs break-all text-right">
				{value}
				{copyable && onCopy && (
					<button
						type="button"
						onClick={onCopy}
						aria-label={label}
						className="flex-none cursor-pointer text-muted-foreground/50 transition-colors hover:text-foreground"
					>
						{copied ? <Check className="h-3 w-3 text-constructive" /> : <Copy className="h-3 w-3" />}
					</button>
				)}
			</span>
		</div>
	)
}

function shorten(address: string): string {
	if (address.length <= 24) return address
	return `${address.slice(0, 12)}…${address.slice(-6)}`
}

function formatCounterparty(address: string, label?: string): string {
	return label ? `${label} (${shorten(address)})` : shorten(address)
}

function formatAmount(xno: number, locale: string): string {
	if (xno >= 1) return xno.toLocaleString(locale, { maximumFractionDigits: 4 })
	if (xno > 0) return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
	return '0'
}
