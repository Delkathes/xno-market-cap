'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { convert, Unit } from 'nanocurrency'
import { useTranslations } from 'next-intl'

interface UnitOption {
	unit: Unit
	label: string
}

const UNITS: UnitOption[] = [
	{ unit: Unit.Nano, label: 'XNO' },
	{ unit: Unit.raw, label: 'raw' },
	{ unit: Unit.nano, label: 'mXNO' },
	{ unit: Unit.knano, label: 'kXNO' },
	{ unit: Unit.KNano, label: 'KXNO' },
	{ unit: Unit.MNano, label: 'MXNO' },
]

const emptyValues = (): Record<string, string> => Object.fromEntries(UNITS.map((option) => [option.unit, '']))

export function UnitConverter() {
	const t = useTranslations('tools.converter')
	const [values, setValues] = useState<Record<string, string>>(emptyValues)
	const [source, setSource] = useState<Unit>(Unit.Nano)
	const [copied, setCopied] = useState<string | null>(null)

	const handleChange = (unit: Unit, rawValue: string) => {
		setSource(unit)

		if (rawValue.trim() === '') {
			setValues(emptyValues())
			return
		}

		let xno: string
		try {
			xno = convert(rawValue.trim(), { from: unit, to: Unit.Nano })
		} catch {
			xno = ''
		}

		if (xno === '') {
			// Invalid input: keep what was typed in its own cell, clear the rest.
			const next = emptyValues()
			next[unit] = rawValue
			setValues(next)
			return
		}

		const next: Record<string, string> = {}
		for (const option of UNITS) {
			if (option.unit === unit) {
				next[unit] = rawValue
			} else {
				try {
					next[option.unit] = convert(xno, { from: Unit.Nano, to: option.unit })
				} catch {
					next[option.unit] = ''
				}
			}
		}
		setValues(next)
	}

	const handleCopy = async (unit: Unit) => {
		const value = values[unit]
		if (!value) return
		try {
			await navigator.clipboard.writeText(value)
			setCopied(unit)
			setTimeout(() => setCopied(null), 1500)
		} catch {
			// clipboard unavailable
		}
	}

	return (
		<div className="space-y-5">
			<div className="overflow-hidden rounded-md border border-border">
				{/* Header */}
				<div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-2">
					<span className="w-16 flex-none font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:w-20">
						{t('unit')}
					</span>
					<span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
						{t('value')}
					</span>
					<span className="w-9 flex-none" aria-hidden="true" />
				</div>

				{UNITS.map((option, index) => {
					const isSource = option.unit === source
					return (
						<div
							key={option.unit}
							className={`flex items-center gap-3 border-b border-border px-4 py-1.5 transition-colors last:border-b-0 ${
								isSource ? 'bg-primary/5' : index % 2 === 1 ? 'bg-muted/10' : ''
							}`}
						>
							<span
								className={`w-16 flex-none font-mono text-sm tabular-nums sm:w-20 ${
									isSource ? 'text-primary' : 'text-muted-foreground'
								}`}
							>
								{option.label}
							</span>
							<input
								type="text"
								inputMode="decimal"
								value={values[option.unit]}
								onChange={(event) => handleChange(option.unit, event.target.value)}
								placeholder="0"
								aria-label={`${option.label} value`}
								className={`w-full min-w-0 flex-1 bg-transparent py-2 font-mono text-sm tabular-nums focus:outline-none ${isSource ? 'text-foreground' : 'text-muted-foreground/90'}`}
							/>
							<button
								type="button"
								onClick={() => handleCopy(option.unit)}
								disabled={!values[option.unit]}
								aria-label={t('copy')}
								className="flex w-9 flex-none cursor-pointer items-center justify-center rounded-sm py-1 text-muted-foreground/50 transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-30"
							>
								{copied === option.unit ? (
									<Check className="h-3.5 w-3.5 text-constructive" />
								) : (
									<Copy className="h-3.5 w-3.5" />
								)}
							</button>
						</div>
					)
				})}
			</div>

			<p className="text-xs text-muted-foreground/70">{t('note')}</p>
		</div>
	)
}
