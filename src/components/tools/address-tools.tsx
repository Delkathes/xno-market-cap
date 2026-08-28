'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Check, Copy, KeyRound, ShieldAlert } from 'lucide-react'
import { deriveAddress, derivePublicKey, generateSeed } from 'nanocurrency'
import { useTranslations } from 'next-intl'

import { isValidNanoAddress } from '@/lib/nano-utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
	ssr: false,
})

const HEX64 = /^[0-9a-fA-F]{64}$/

type Inspection =
	| { kind: 'address'; address: string; prefix: string; publicKey: string }
	| { kind: 'publicKey'; publicKey: string; address: string }
	| null

export function AddressTools() {
	const t = useTranslations('tools.addressTools')
	const [input, setInput] = useState('')
	const [inspection, setInspection] = useState<Inspection>(null)
	const [invalid, setInvalid] = useState(false)
	const [seed, setSeed] = useState<string | null>(null)
	const [seedAddress, setSeedAddress] = useState<string | null>(null)
	const [generating, setGenerating] = useState(false)
	const [copied, setCopied] = useState<string | null>(null)

	const inspect = () => {
		const value = input.trim()
		if (!value) return
		if (value.startsWith('nano_') || value.startsWith('xno_')) {
			if (!isValidNanoAddress(value)) {
				setInvalid(true)
				setInspection(null)
				return
			}
			setInvalid(false)
			setInspection({
				kind: 'address',
				address: value,
				prefix: value.startsWith('xno_') ? 'xno_' : 'nano_',
				publicKey: derivePublicKey(value),
			})
			return
		}
		if (HEX64.test(value)) {
			setInvalid(false)
			setInspection({
				kind: 'publicKey',
				publicKey: value.toLowerCase(),
				address: deriveAddress(value.toLowerCase()),
			})
			return
		}
		setInvalid(true)
		setInspection(null)
	}

	const handleGenerate = async () => {
		setGenerating(true)
		try {
			const newSeed = await generateSeed()
			const publicKey = derivePublicKey(newSeed)
			setSeed(newSeed)
			setSeedAddress(deriveAddress(publicKey))
		} catch {
			setSeed(null)
			setSeedAddress(null)
		} finally {
			setGenerating(false)
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

	const displayAddress =
		inspection?.kind === 'address'
			? inspection.address
			: inspection?.kind === 'publicKey'
				? inspection.address
				: null

	return (
		<div className="space-y-6">
			{/* Inspect & convert */}
			<div className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="at-input"
						className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
					>
						{t('address')}
					</Label>
					<div className="flex gap-2">
						<Input
							id="at-input"
							value={input}
							onChange={(event) => setInput(event.target.value)}
							placeholder={t('addressPlaceholder')}
							className="font-mono"
							aria-invalid={invalid}
							onKeyDown={(event) => {
								if (event.key === 'Enter') inspect()
							}}
						/>
						<Button type="button" onClick={inspect} className="flex-none cursor-pointer">
							<KeyRound className="h-4 w-4" />
							{t('inspect')}
						</Button>
					</div>
					{invalid && <p className="text-xs text-destructive">{t('invalid')}</p>}
				</div>

				{inspection && (
					<div className="space-y-3 rounded-md border border-border bg-muted/20 p-4 animate-fade-in-up">
						{inspection.kind === 'address' && (
							<>
								<div className="flex items-center gap-2 text-sm text-constructive">
									<Check className="h-4 w-4" />
									{t('valid')}
									<span className="text-xs text-muted-foreground">· {t('checksum')}</span>
								</div>
								<ReadoutRow label={t('prefix')} value={inspection.prefix} />
								<ReadoutRow
									label={t('publicKey')}
									value={inspection.publicKey}
									copyKey="pk"
									onCopy={handleCopy}
									copied={copied}
									t={t}
								/>
							</>
						)}
						{inspection.kind === 'publicKey' && (
							<>
								<div className="flex items-center gap-2 text-sm text-constructive">
									<Check className="h-4 w-4" />
									{t('valid')}
								</div>
								<ReadoutRow
									label={t('derivedAddress')}
									value={inspection.address}
									copyKey="addr"
									onCopy={handleCopy}
									copied={copied}
									t={t}
								/>
							</>
						)}
					</div>
				)}
			</div>

			{/* Address QR */}
			{displayAddress && (
				<div className="flex items-center gap-5 rounded-md border border-border bg-muted/20 p-4 animate-fade-in-up">
					<div className="rounded-sm border border-border bg-white p-2">
						<QRCodeSVG value={displayAddress} size={110} level="M" marginSize={0} />
					</div>
					<div>
						<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
							{t('qr')}
						</div>
						<div className="mt-1 font-mono text-sm break-all">{displayAddress}</div>
					</div>
				</div>
			)}

			<div className="border-t border-dashed border-border" />

			{/* Seed generator */}
			<div className="space-y-4">
				<div>
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('seedSection')}
					</div>
					<p className="mt-1 text-sm text-muted-foreground/80">{t('seedLabel')}</p>
				</div>

				<Button
					type="button"
					variant="outline"
					onClick={handleGenerate}
					disabled={generating}
					className="cursor-pointer"
				>
					{generating ? '...' : <KeyRound className="h-4 w-4" />}
					{t('generate')}
				</Button>

				{seed && (
					<div className="space-y-3 animate-fade-in-up">
						<ReadoutRow
							label="Seed"
							value={seed}
							copyKey="seed"
							onCopy={handleCopy}
							copied={copied}
							t={t}
						/>
						{seedAddress && (
							<ReadoutRow
								label={t('derivedAddress')}
								value={seedAddress}
								copyKey="seedaddr"
								onCopy={handleCopy}
								copied={copied}
								t={t}
							/>
						)}
						<div className="flex items-start gap-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground">
							<ShieldAlert className="mt-0.5 h-4 w-4 flex-none text-amber-500" />
							{t('seedWarning')}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

type Translator = ReturnType<typeof useTranslations>

function ReadoutRow({
	label,
	value,
	copyKey,
	onCopy,
	copied,
	t,
}: {
	label: string
	value: string
	copyKey?: string
	onCopy?: (value: string, key: string) => void
	copied?: string | null
	t?: Translator
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
				<div className="mt-0.5 font-mono text-sm break-all tabular-nums">{value}</div>
			</div>
			{copyKey && onCopy && t && (
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
			)}
		</div>
	)
}
