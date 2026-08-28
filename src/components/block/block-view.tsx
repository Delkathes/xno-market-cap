'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import type { BlockDetails } from '@/lib/block-data-service'
import { cn } from '@/lib/utils'

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
	return `${hash.slice(0, 12)}…${hash.slice(-6)}`
}

function formatXno(xno: number, locale: string): string {
	const l = locale ?? 'en-US'
	if (xno >= 1_000_000) return `${(xno / 1_000_000).toLocaleString(l, { maximumFractionDigits: 2 })}M`
	if (xno >= 1) return xno.toLocaleString(l, { maximumFractionDigits: 2 })
	if (xno > 0) return xno.toLocaleString(l, { maximumFractionDigits: 6 })
	return '0'
}

function formatTime(ts: number | null, locale: string): string {
	if (ts === null) return '·'
	return new Date(ts * 1000).toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC',
	})
}

export interface BlockViewProps {
	hash: string
	locale: string
	details: BlockDetails | null
	labels?: Record<string, string>
}

export function BlockView({ hash, locale, details, labels }: BlockViewProps) {
	const t = useTranslations('block')
	const [copied, setCopied] = useState<string | null>(null)

	if (!details) {
		return (
			<section className="relative border border-border bg-card/60 backdrop-blur-sm rounded-sm p-5 sm:p-8 text-center">
				<RegistrationMarks />
				<h1 className="text-xl font-semibold tracking-tight">{t('notFoundTitle')}</h1>
				<p className="mt-2 text-sm text-muted-foreground">{t('notFoundBody')}</p>
				<Link
					href="/explore"
					className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					<Search className="h-4 w-4" />
					{t('backToExplore')}
				</Link>
			</section>
		)
	}

	const subtype = details.subtype || 'unknown'
	const isSend = subtype === 'send'
	const isReceive = subtype === 'receive' || subtype === 'open'
	const badgeClass = isSend
		? 'bg-destructive/10 text-destructive'
		: isReceive
			? 'bg-constructive/15 text-constructive'
			: 'bg-muted text-muted-foreground'

	const handleCopy = async (value: string) => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(value)
		} catch {
			setCopied(null)
		}
	}

	const counterpartyLabel = isSend
		? details.linkAsAccount
			? (labels?.[details.linkAsAccount] ?? details.linkAsAccount)
			: ''
		: isReceive
			? details.sourceAccount
				? (labels?.[details.sourceAccount] ?? details.sourceAccount)
				: ''
			: ''

	const stats: Array<{
		label: string
		value: string
		href?: string
		copyable?: boolean
	}> = [
		{
			label: t('account'),
			value: labels?.[details.blockAccount] ?? details.blockAccount,
			href: `/account/${details.blockAccount}`,
		},
		{
			label: t('counterparty'),
			value: counterpartyLabel || '·',
			href: counterpartyLabel ? `/account/${details.linkAsAccount || details.sourceAccount}` : undefined,
		},
		{ label: t('height'), value: details.height > 0 ? String(details.height) : '·' },
		{ label: t('received'), value: formatTime(details.localTimestamp, locale) },
		{ label: t('balance'), value: `${formatXno(details.balanceXno, locale)} XNO` },
		{
			label: t('representative'),
			value: labels?.[details.representative] ?? details.representative,
			href: details.representative ? `/account/${details.representative}` : undefined,
		},
		{ label: t('work'), value: details.work || '·', copyable: !!details.work },
		{ label: t('signature'), value: details.signature || '·', copyable: !!details.signature },
		...(details.previous
			? [{ label: t('previous'), value: shortenHash(details.previous), href: `/block/${details.previous}` }]
			: []),
		...(details.successor
			? [{ label: t('successor'), value: shortenHash(details.successor), href: `/block/${details.successor}` }]
			: []),
	]

	return (
		<section className="relative border border-border bg-card/60 backdrop-blur-sm rounded-sm p-5 sm:p-8">
			<RegistrationMarks />

			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
				<span className="text-primary">{t('blockLabel')}</span>
				<span className="text-muted-foreground/50">/</span>
				<span
					className={cn(
						'rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.15em]',
						badgeClass,
					)}
				>
					{subtype.toUpperCase()}
				</span>
				<span
					className={cn(
						'flex items-center gap-1.5',
						details.confirmed ? 'text-constructive' : 'text-amber-500',
					)}
				>
					<span
						className={cn(
							'h-1.5 w-1.5 rounded-full',
							details.confirmed ? 'bg-constructive' : 'bg-amber-500',
						)}
					/>
					{details.confirmed ? t('confirmed') : t('unconfirmed')}
				</span>
			</div>

			<div className="mt-4 flex items-start gap-3">
				<h1 className="min-w-0 break-all font-mono text-base leading-snug sm:text-xl">{hash}</h1>
				<button
					type="button"
					onClick={() => handleCopy(details.hash)}
					className="mt-0.5 flex-none text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
					aria-label={t('copyHash')}
					title={t('copyHash')}
				>
					{copied === details.hash ? (
						<Check className="h-4 w-4 text-constructive" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</button>
			</div>

			<div className="mt-6 flex items-baseline gap-3">
				<span className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
					{formatXno(details.amountXno, locale)}
				</span>
				<span className="text-xl text-primary">XNO</span>
			</div>

			<dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
				{stats.map((stat) => (
					<div key={stat.label} className="min-w-0 bg-card/95 px-3 py-2.5">
						<dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
							{stat.label}
						</dt>
						<dd className="mt-1 flex min-w-0 items-center justify-between gap-2">
							{stat.href ? (
								<Link
									href={stat.href}
									className="min-w-0 break-all font-mono text-xs text-primary transition-colors hover:text-primary/70"
								>
									{stat.value}
								</Link>
							) : (
								<span className="min-w-0 break-all font-mono text-xs">{stat.value}</span>
							)}
							{stat.copyable && (
								<button
									type="button"
									onClick={() => handleCopy(stat.value)}
									className="flex-none text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
									aria-label={t('copy')}
								>
									{copied === stat.value ? (
										<Check className="h-3.5 w-3.5 text-constructive" />
									) : (
										<Copy className="h-3.5 w-3.5" />
									)}
								</button>
							)}
						</dd>
					</div>
				))}
			</dl>

			<div className="mt-6 flex flex-wrap gap-4">
				{details.previous && (
					<Link
						href={`/block/${details.previous}`}
						className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						{t('prevBlock', { hash: shortenHash(details.previous) })}
					</Link>
				)}
				{details.successor && (
					<Link
						href={`/block/${details.successor}`}
						className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						{t('nextBlock', { hash: shortenHash(details.successor) })}
						<ArrowRight className="h-3.5 w-3.5" />
					</Link>
				)}
			</div>

			<details className="group mt-8">
				<summary className="flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
					<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
					{t('rawContents')}
				</summary>
				<pre className="mt-3 overflow-x-auto rounded-sm border border-border bg-background/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
					{JSON.stringify(details.contentsRaw, null, 2)}
				</pre>
			</details>
		</section>
	)
}
