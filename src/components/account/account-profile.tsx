'use client'

import type { Route } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Link2, ScanSearch } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { AccountData, AccountHistoryPage } from '@/lib/account-data-service'
import type { CompareRates } from '@/lib/market-data-service'
import { isValidNanoAddress } from '@/lib/nano-utils'

import { type LiveTransaction, useAccountConfirmations } from '@/hooks/use-account-confirmations'
import { useIsClientSide } from '@/hooks/use-is-client-side'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccountCompare } from '@/components/account/account-compare'
import { AccountHistory } from '@/components/account/account-history'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	ssr: false,
})

export interface AccountProfileProps {
	address: string
	locale: string
	state: 'ok' | 'empty' | 'notFound' | 'rpcError'
	data?: AccountData
	rates?: CompareRates | null
	pinnedSymbols?: string[]
	vsOverride?: boolean
	historyPage?: AccountHistoryPage
	labels?: Record<string, string>
}
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

function useAnimatedValue(initial: number): [number, (target: number, fromOverride?: number) => void] {
	const [value, setValue] = useState(initial)
	const valueRef = useRef(initial)
	const rafRef = useRef(0)

	const animateTo = useCallback((target: number, fromOverride?: number) => {
		cancelAnimationFrame(rafRef.current)
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			valueRef.current = target
			setValue(target)
			return
		}
		const from = fromOverride ?? valueRef.current
		const duration = 700
		const start = performance.now()
		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1)
			const eased = 1 - (1 - progress) ** 3
			const current = from + (target - from) * eased
			valueRef.current = current
			setValue(current)
			if (progress < 1) rafRef.current = requestAnimationFrame(tick)
		}
		rafRef.current = requestAnimationFrame(tick)
	}, [])

	useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

	return [value, animateTo]
}

function formatBalance(xno: number, locale: string): string {
	const l = locale ?? 'en-US'
	if (xno >= 1_000_000) {
		return `${(xno / 1_000_000).toLocaleString(l, { maximumFractionDigits: 2 })}M`
	}
	if (xno >= 1) {
		return xno.toLocaleString(l, { maximumFractionDigits: 2 })
	}
	return '0'
}

function formatLiveAmount(xno: number, locale: string): string {
	if (xno >= 1) return xno.toLocaleString(locale, { maximumFractionDigits: 4 })
	if (xno > 0) return xno.toLocaleString(locale, { maximumFractionDigits: 6 })
	return '0'
}

function shortenAddress(address: string): string {
	if (address.length <= 24) return address
	return `${address.slice(0, 12)}…${address.slice(-6)}`
}

interface LiveToast {
	id: number
	subtype: string
	amountXno: number
	counterparty: string
}

export function AccountProfile({
	address,
	locale,
	state,
	data,
	rates,
	pinnedSymbols,
	vsOverride,
	historyPage,
	labels,
}: AccountProfileProps) {
	const t = useTranslations('account')
	const router = useRouter()
	const isClient = useIsClientSide()
	const [copied, setCopied] = useState<string | null>(null)
	const [query, setQuery] = useState('')

	const [displayBalance, animateBalance] = useAnimatedValue(state === 'ok' && data ? data.balanceXno : 0)
	const [glow, setGlow] = useState(false)
	const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [toasts, setToasts] = useState<LiveToast[]>([])
	const toastIdRef = useRef(0)
	const [liveEntries, setLiveEntries] = useState<LiveTransaction[]>([])
	const displayBalanceRef = useRef(displayBalance)

	useEffect(() => {
		displayBalanceRef.current = displayBalance
	}, [displayBalance])

	// Page-load count-up from 0.
	useEffect(() => {
		if (state === 'ok' && data) {
			animateBalance(data.balanceXno, 0)
		}
	}, [state, data, animateBalance])

	const triggerGlow = useCallback(() => {
		setGlow(true)
		if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current)
		glowTimeoutRef.current = setTimeout(() => setGlow(false), 1400)
	}, [])

	const pushToast = useCallback((toast: Omit<LiveToast, 'id'>) => {
		const id = ++toastIdRef.current
		setToasts((current) => [...current.slice(-2), { ...toast, id }])
		setTimeout(() => {
			setToasts((current) => current.filter((entry) => entry.id !== id))
		}, 5000)
	}, [])

	const handleNewBlock = useCallback(
		(tx: LiveTransaction) => {
			const delta = tx.subtype === 'receive' ? tx.amountXno : tx.subtype === 'send' ? -tx.amountXno : 0
			if (delta !== 0) {
				animateBalance(displayBalanceRef.current + delta)
				triggerGlow()
			}
			setLiveEntries((current) => [tx, ...current].slice(0, 30))
			pushToast({ subtype: tx.subtype, amountXno: tx.amountXno, counterparty: tx.counterparty })
		},
		[animateBalance, pushToast, triggerGlow],
	)

	const { wsConnected } = useAccountConfirmations({
		address,
		enabled: state === 'ok' && !!data,
		onNewBlock: handleNewBlock,
	})

	// Poll fallback when the socket is unavailable: keep the balance honest.
	useEffect(() => {
		if (!data || wsConnected) return
		const id = setInterval(async () => {
			try {
				const response = await fetch(`/api/account-info?address=${encodeURIComponent(address)}`)
				if (!response.ok) return
				const json = (await response.json()) as { balanceXno?: number }
				if (
					typeof json.balanceXno === 'number' &&
					Math.abs(json.balanceXno - displayBalanceRef.current) > 0.000001
				) {
					const delta = json.balanceXno - displayBalanceRef.current
					animateBalance(json.balanceXno)
					triggerGlow()
					pushToast({ subtype: delta > 0 ? 'receive' : 'send', amountXno: Math.abs(delta), counterparty: '' })
				}
			} catch {
				// transient network error, next tick
			}
		}, 60_000)
		return () => clearInterval(id)
	}, [data, wsConnected, address, animateBalance, pushToast, triggerGlow])

	const addressValid = isValidNanoAddress(query.trim())

	const handleCopy = async (value: string, key: string) => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(key)
			setTimeout(() => setCopied(null), 1500)
		} catch {
			// clipboard unavailable
		}
	}

	const openAccount = () => {
		if (!addressValid) return
		const prefix = locale === 'en' ? '' : `/${locale}`
		router.push(`${prefix}/account/${query.trim()}` as Route)
	}

	const shareUrl = isClient ? window.location.href : ''

	return (
		<div className="space-y-6">
			<section className="relative rounded-md border border-border bg-card p-5 shadow-xs sm:p-6">
				<RegistrationMarks />

				{/* Address + actions */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
								{t('address')}
							</span>
							<span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
								<span
									className={`h-1.5 w-1.5 rounded-full ${
										wsConnected ? 'animate-live-pulse bg-constructive' : 'bg-muted-foreground/40'
									}`}
								/>
								{wsConnected ? t('live') : t('polling')}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(address, 'address')}
								className="cursor-pointer text-muted-foreground"
							>
								{copied === 'address' ? (
									<Check className="h-3.5 w-3.5" />
								) : (
									<Copy className="h-3.5 w-3.5" />
								)}
								{copied === 'address' ? t('copied') : t('copy')}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(shareUrl || window.location.href, 'link')}
								className="cursor-pointer text-muted-foreground"
							>
								{copied === 'link' ? (
									<Check className="h-3.5 w-3.5" />
								) : (
									<Link2 className="h-3.5 w-3.5" />
								)}
								{copied === 'link' ? t('linkCopied') : t('copyLink')}
							</Button>
						</div>
						<h1 className="mt-2 font-mono text-lg font-semibold tracking-tight text-balance break-all">
							{address}
						</h1>
						{labels?.[address] && (
							<span className="mt-1.5 inline-flex items-center rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
								{labels[address]}
							</span>
						)}
					</div>

					{/* QR tile */}
					<div className="flex-none self-center sm:self-start">
						<div className="rounded-sm border border-border bg-white p-2 h-26 w-26">
							{isClient ? (
								<QRCodeSVG
									value={address}
									size={88}
									level="M"
									marginSize={0}
									className="block h-full w-full"
								/>
							) : (
								<div className="h-full w-full bg-muted/30" aria-hidden="true" />
							)}
						</div>
					</div>
				</div>

				{state === 'ok' && data ? (
					<>
						{/* Balance hero */}
						<div className="mt-6 border-t border-border pt-6">
							<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
								{t('balance')}
							</div>
							<div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<span
									className={`text-5xl font-bold tracking-tight tabular-nums ${glow ? 'animate-balance-glow' : ''}`}
								>
									{formatBalance(displayBalance, locale)}
								</span>
								<span className="text-sm font-normal text-muted-foreground">XNO</span>
								{data.principal && (
									<span className="inline-flex items-center rounded-sm border border-constructive/30 bg-constructive/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-constructive">
										{t('principalYes')}
									</span>
								)}
							</div>
						</div>

						{/* Fiat equivalent strip */}
						{rates && rates.fiats.length > 0 && (
							<div className="mt-4">
								<div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-4 md:grid-cols-7">
									{rates.fiats.map((fiat) => (
										<div key={fiat.code} className="bg-card px-3 py-2">
											<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
												{fiat.code}
											</div>
											<div className="mt-1 font-mono text-sm font-semibold tracking-tight tabular-nums">
												{fiat.symbol}{' '}
												{(displayBalance * fiat.perXno).toLocaleString(locale, {
													maximumFractionDigits: fiat.precision,
												})}
											</div>
											<div className="mt-0.5 font-mono text-[11px] text-muted-foreground/70 tabular-nums">
												1 XNO = {fiat.symbol}{' '}
												{fiat.perXno.toLocaleString(locale, {
													minimumFractionDigits: fiat.precision,
													maximumFractionDigits: fiat.precision,
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Compare to top-100 coins */}
						{rates && (
							<AccountCompare
								rates={rates}
								initialPins={pinnedSymbols ?? []}
								vsOverride={vsOverride ?? false}
								locale={locale}
								balanceXno={displayBalance}
							/>
						)}

						{/* Stat strip */}
						<div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-4">
							<StatCell label={t('pending')} value={formatBalance(data.pendingXno, locale)} unit="XNO" />
							<StatCell
								label={t('votingWeight')}
								value={formatBalance(data.weightXno, locale)}
								unit="XNO"
							/>
							<StatCell label={t('blocks')} value={data.blockCount.toLocaleString()} unit="" />
							<StatCell
								label={t('principal')}
								value={data.principal ? t('principalYes') : t('principalNo')}
								unit=""
								badge={data.rank !== null ? `${t('rank')} · #${data.rank}` : undefined}
							/>
						</div>

						{/* Ledger rows: rep / frontier / open block */}
						<div className="mt-6 space-y-3 border-t border-border pt-6">
							<LedgerRow
								label={t('representedBy')}
								value={data.representative}
								copyKey="rep"
								copied={copied}
								onCopy={handleCopy}
								tag={labels?.[data.representative] ?? undefined}
							/>
							<LedgerRow
								label={t('frontier')}
								value={data.frontier}
								copyKey="frontier"
								copied={copied}
								onCopy={handleCopy}
							/>
							<LedgerRow
								label={t('openBlock')}
								value={data.openBlock}
								copyKey="open"
								copied={copied}
								onCopy={handleCopy}
							/>
						</div>

						{/* Transaction history */}
						{historyPage && (
							<div className="mt-6 border-t border-border pt-6">
								<AccountHistory
									address={address}
									locale={locale}
									initialPage={historyPage}
									liveEntries={liveEntries}
									labels={labels}
								/>
							</div>
						)}
					</>
				) : state === 'empty' ? (
					<div className="mt-6 border-t border-border pt-6">
						<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
							{t('pending')}
						</div>
						<p className="mt-2 text-lg font-semibold tracking-tight">{t('unopened')}</p>
						<p className="mt-1 text-sm text-muted-foreground/80">{t('unopenedHint')}</p>
					</div>
				) : state === 'notFound' ? (
					<div className="mt-6 border-t border-border pt-6">
						<p className="text-lg font-semibold tracking-tight">{t('notFoundTitle')}</p>
						<p className="mt-1 text-sm text-muted-foreground/80">{t('notFoundText')}</p>
					</div>
				) : (
					<div className="mt-6 border-t border-border pt-6">
						<p className="text-lg font-semibold tracking-tight">{t('rpcErrorTitle')}</p>
						<p className="mt-1 text-sm text-muted-foreground/80">{t('rpcErrorText')}</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => router.refresh()}
							className="mt-3 cursor-pointer"
						>
							{t('retry')}
						</Button>
					</div>
				)}
			</section>

			{state === 'ok' && data && (
				<div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
					<a
						href={`https://blocklattice.io/account/${address}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
					>
						<ExternalLink className="h-3 w-3" />
						{t('viewBlocklattice')}
					</a>
					<a
						href={`https://nanexplorer.com/nano/accounts/${address}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
					>
						<ExternalLink className="h-3 w-3" />
						{t('viewNanexplorer')}
					</a>
				</div>
			)}

			{/* Jump-to search */}
			<section
				className="rounded-md border border-border bg-card p-4 shadow-xs animate-fade-in-up"
				style={{ animationDelay: '160ms' }}
			>
				<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('jumpTo')}
				</div>
				<div className="mt-2 flex gap-2">
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder={t('searchPlaceholder')}
						className="font-mono"
						aria-invalid={query.trim() !== '' && !addressValid}
						onKeyDown={(event) => {
							if (event.key === 'Enter') openAccount()
						}}
					/>
					<Button
						type="button"
						onClick={openAccount}
						disabled={!addressValid}
						className="flex-none cursor-pointer"
					>
						<ScanSearch className="h-4 w-4" />
						{t('open')}
					</Button>
				</div>
				{query.trim() !== '' && !addressValid && (
					<p className="mt-1.5 text-xs text-destructive">{t('invalidAddress')}</p>
				)}
			</section>

			{/* Live transaction toasts */}
			<div
				aria-live="polite"
				className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-72 flex-col gap-2"
			>
				{toasts.map((toast) => {
					const isReceive = toast.subtype === 'receive'
					const isSend = toast.subtype === 'send'
					const message =
						toast.subtype === 'balance'
							? t('toastBalance')
							: toast.subtype === 'change'
								? t('toastChange')
								: isReceive
									? t('toastReceived', { amount: formatLiveAmount(toast.amountXno, locale) })
									: isSend
										? t('toastSent', { amount: formatLiveAmount(toast.amountXno, locale) })
										: ''
					return (
						<div
							key={toast.id}
							className="animate-toast-in pointer-events-auto rounded-md border border-border bg-card p-3 shadow-lg"
						>
							<div className="flex items-center gap-2.5">
								<span
									className={`flex h-6 w-6 flex-none items-center justify-center rounded-[3px] font-mono text-[11px] leading-none ${
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
								<div className="min-w-0">
									<div className="font-mono text-sm tabular-nums">{message}</div>
									{toast.counterparty && (
										<div className="truncate text-[11px] text-muted-foreground">
											{isReceive
												? t('from', { address: shortenAddress(toast.counterparty) })
												: t('to', { address: shortenAddress(toast.counterparty) })}
										</div>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function StatCell({ label, value, unit, badge }: { label: string; value: string; unit: string; badge?: string }) {
	return (
		<div className="bg-card p-3.5">
			<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
			<div className="mt-1.5 font-bold tracking-tight tabular-nums">
				{value}
				{unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
			</div>
			{badge && <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{badge}</div>}
		</div>
	)
}

function LedgerRow({
	label,
	value,
	copyKey,
	copied,
	onCopy,
	tag,
}: {
	label: string
	value: string
	copyKey: string
	copied: string | null
	onCopy: (value: string, key: string) => void
	tag?: string
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
				{tag && (
					<div className="mt-1 inline-flex items-center rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
						{tag}
					</div>
				)}
				<div className="mt-0.5 font-mono text-sm break-all">{value || '·'}</div>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => onCopy(value, copyKey)}
				disabled={!value}
				className="flex-none cursor-pointer text-muted-foreground"
			>
				{copied === copyKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
			</Button>
		</div>
	)
}
