'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Check, Copy, Link2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { createNanoUri, isValidNanoAddress, xnoToRaw } from '@/lib/nano-utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	ssr: false,
})

export function PaymentLinkBuilder() {
	const t = useTranslations('tools.paymentLinks')
	const [address, setAddress] = useState('')
	const [amount, setAmount] = useState('')
	const [label, setLabel] = useState('')
	const [message, setMessage] = useState('')
	const [copied, setCopied] = useState<'uri' | 'address' | null>(null)

	const addressValid = address.trim() !== '' && isValidNanoAddress(address.trim())
	const amountValid = amount.trim() === '' || (!Number.isNaN(Number(amount)) && Number(amount) > 0)

	const uri = useMemo(() => {
		if (!addressValid) return null
		const raw = amount.trim() === '' ? '0' : xnoToRaw(amount.trim())
		if (raw === '0' && amount.trim() !== '') return null
		return createNanoUri(address.trim(), raw, { label: label.trim(), message: message.trim() })
	}, [address, addressValid, amount, label, message])

	const showError = address.trim() !== '' && !addressValid

	const handleCopy = async (value: string, key: 'uri' | 'address') => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(key)
			setTimeout(() => setCopied(null), 1500)
		} catch {
			// clipboard unavailable
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="pl-address"
						className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
					>
						{t('address')}
					</Label>
					<Input
						id="pl-address"
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						placeholder={t('addressPlaceholder')}
						className="font-mono"
						aria-invalid={showError}
					/>
					{showError && <p className="text-xs text-destructive">{t('invalidAddress')}</p>}
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="pl-amount"
						className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
					>
						{t('amount')}
					</Label>
					<Input
						id="pl-amount"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						placeholder={t('amountPlaceholder')}
						inputMode="decimal"
						className="font-mono tabular-nums"
						aria-invalid={!amountValid && amount.trim() !== ''}
					/>
					{!amountValid && amount.trim() !== '' && (
						<p className="text-xs text-destructive">{t('invalidAmount')}</p>
					)}
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label
							htmlFor="pl-label"
							className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
						>
							{t('label')}
						</Label>
						<Input
							id="pl-label"
							value={label}
							onChange={(event) => setLabel(event.target.value)}
							placeholder={t('labelPlaceholder')}
						/>
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="pl-message"
							className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
						>
							{t('message')}
						</Label>
						<Input
							id="pl-message"
							value={message}
							onChange={(event) => setMessage(event.target.value)}
							placeholder={t('messagePlaceholder')}
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<div className="rounded-md border border-dashed border-border bg-muted/20 p-4">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('uriPreview')}
					</div>
					<div className="mt-2 min-h-10 font-mono text-sm break-all" aria-live="polite">
						{uri ?? '· · ·'}
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!uri}
							onClick={() => uri && handleCopy(uri, 'uri')}
							className="cursor-pointer"
						>
							{copied === 'uri' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
							{copied === 'uri' ? t('copied') : t('copyUri')}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={!addressValid}
							onClick={() => handleCopy(address.trim(), 'address')}
							className="cursor-pointer"
						>
							{copied === 'address' ? (
								<Check className="h-3.5 w-3.5" />
							) : (
								<Link2 className="h-3.5 w-3.5" />
							)}
							{copied === 'address' ? t('copied') : t('copyAddress')}
						</Button>
					</div>
				</div>

				<div className="flex flex-1 flex-col items-center justify-center rounded-md border border-border bg-card p-4">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
						{t('qr')}
					</div>
					{uri ? (
						<div className="rounded-sm border border-border bg-white p-3">
							<QRCodeSVG value={uri} size={180} level="M" marginSize={0} />
						</div>
					) : (
						<div
							className="flex h-45 w-45 items-center justify-center border border-dashed border-border text-4xl text-muted-foreground/20 select-none"
							aria-hidden="true"
						>
							···
						</div>
					)}
					{uri && (
						<p className="mt-3 text-xs text-muted-foreground">
							<a className="text-primary hover:underline" href={uri}>
								{t('shareable')}
							</a>
						</p>
					)}
				</div>
			</div>

			<p className="text-xs text-muted-foreground/70 lg:col-span-2">{t('note')}</p>
		</div>
	)
}
