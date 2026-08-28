'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, ScanSearch } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { isValidNanoAddress } from '@/lib/nano-utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AccountResult {
	address: string
	balanceXno: number
	pendingXno: number
	representative: string
	frontier: string
	openBlock: string
	weightXno: number
	onlineWeightXno: number
	shareOfOnline: number
	principal: boolean
	rank: number | null
}

type Status = 'idle' | 'loading' | 'error' | 'notFound' | 'rpcError'

export function AccountInspector() {
	const t = useTranslations('tools.accountInspector')
	const [address, setAddress] = useState('')
	const [status, setStatus] = useState<Status>('idle')
	const [result, setResult] = useState<AccountResult | null>(null)
	const [copied, setCopied] = useState<string | null>(null)

	const addressValid = isValidNanoAddress(address.trim())

	const inspect = async () => {
		if (!addressValid) return
		setStatus('loading')
		setResult(null)
		try {
			const response = await fetch(`/api/account-info?address=${encodeURIComponent(address.trim())}`)
			if (response.status === 404) {
				setStatus('notFound')
				return
			}
			if (!response.ok) {
				setStatus('rpcError')
				return
			}
			const json = (await response.json()) as AccountResult
			setResult(json)
			setStatus('idle')
		} catch {
			setStatus('rpcError')
		}
	}

	const handleCopy = async (value: string, key: string) => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(key)
			setTimeout(() => setCopied(null), 1500)
		} catch {
			// clipboard unavailable
		}
	}

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<Label
					htmlFor="ai-address"
					className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
				>
					{t('address')}
				</Label>
				<div className="flex gap-2">
					<Input
						id="ai-address"
						value={address}
						onChange={(event) => {
							setAddress(event.target.value)
							setStatus('idle')
						}}
						placeholder={t('addressPlaceholder')}
						className="font-mono"
						aria-invalid={address.trim() !== '' && !addressValid}
						onKeyDown={(event) => {
							if (event.key === 'Enter') inspect()
						}}
					/>
					<Button
						type="button"
						onClick={inspect}
						disabled={!addressValid || status === 'loading'}
						className="flex-none cursor-pointer"
					>
						{status === 'loading' ? (
							<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						) : (
							<ScanSearch className="h-4 w-4" />
						)}
						{t('inspect')}
					</Button>
				</div>
				{address.trim() !== '' && !addressValid && (
					<p className="text-xs text-destructive">{t('invalidAddress')}</p>
				)}
				{status === 'loading' && <p className="text-xs text-muted-foreground">{t('checking')}</p>}
				{status === 'notFound' && <p className="text-xs text-destructive">{t('notFound')}</p>}
				{status === 'rpcError' && <p className="text-xs text-destructive">{t('rpcError')}</p>}
			</div>

			{result && (
				<div className="space-y-4 animate-fade-in-up">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<StatCard label={t('balance')} value={formatWeight(result.balanceXno)} unit="XNO" />
						<StatCard label={t('pending')} value={formatWeight(result.pendingXno)} unit="XNO" />
						<StatCard
							label={t('votingWeight')}
							value={formatWeight(result.weightXno)}
							unit="XNO"
							badge={
								result.weightXno > 0
									? `${(result.shareOfOnline * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}% ${t('shareOfOnline')}`
									: undefined
							}
						/>
						<div className="rounded-md border border-border bg-muted/20 p-4">
							<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
								{t('principal')}
							</div>
							<div
								className={`mt-1.5 text-lg font-bold tracking-tight tabular-nums ${result.principal ? 'text-constructive' : 'text-muted-foreground'}`}
							>
								{result.principal ? t('principalYes') : t('principalNo')}
							</div>
							{result.rank !== null && (
								<div className="mt-1 text-xs text-muted-foreground tabular-nums">
									{t('rank')} · #{result.rank}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-2.5 rounded-md border border-border bg-muted/20 p-4">
						<Row
							label={t('representative')}
							value={result.representative}
							copyKey="rep"
							onCopy={handleCopy}
							copied={copied}
							t={t}
						/>
						<Row
							label={t('frontier')}
							value={result.frontier}
							copyKey="frontier"
							onCopy={handleCopy}
							copied={copied}
							t={t}
						/>
						<Row
							label={t('openBlock')}
							value={result.openBlock}
							copyKey="open"
							onCopy={handleCopy}
							copied={copied}
							t={t}
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						<a
							href={`https://blocklattice.io/account/${result.address}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
						>
							<ExternalLink className="h-3 w-3" />
							{t('viewBlocklattice')}
						</a>
						<a
							href={`https://nanexplorer.com/nano/accounts/${result.address}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
						>
							<ExternalLink className="h-3 w-3" />
							{t('viewNanexplorer')}
						</a>
					</div>
				</div>
			)}

			<p className="text-xs text-muted-foreground/70">{t('note')}</p>
		</div>
	)
}

function StatCard({ label, value, unit, badge }: { label: string; value: string; unit: string; badge?: string }) {
	return (
		<div className="rounded-md border border-border bg-muted/20 p-4">
			<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
			<div className="mt-1.5 text-lg font-bold tracking-tight tabular-nums">
				{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
			</div>
			{badge && <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{badge}</div>}
		</div>
	)
}

type Translator = ReturnType<typeof useTranslations>

function Row({
	label,
	value,
	copyKey,
	onCopy,
	copied,
	t,
}: {
	label: string
	value: string
	copyKey: string
	onCopy: (value: string, key: string) => void
	copied: string | null
	t: Translator
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
				<div className="mt-0.5 font-mono text-sm break-all">{value}</div>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => onCopy(value, copyKey)}
				className="flex-none cursor-pointer"
			>
				{copied === copyKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
				{copied === copyKey ? t('copied') : t('copy')}
			</Button>
		</div>
	)
}

function formatWeight(weight: number): string {
	if (weight >= 1_000_000) {
		return `${(weight / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
	}
	if (weight >= 1_000) {
		return `${(weight / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
	}
	if (weight > 0 && weight < 0.001) {
		return weight.toFixed(6)
	}
	return weight.toLocaleString(undefined, { maximumFractionDigits: 4 })
}
