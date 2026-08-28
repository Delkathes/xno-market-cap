'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { isValidBlockHash, isValidNanoAddress } from '@/lib/nano-utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export function ExplorerSearch({ locale }: { locale: string }) {
	const t = useTranslations('explore')
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [error, setError] = useState(false)

	const prefix = locale === 'en' ? '' : `/${locale}`

	// Strip a nano: URI prefix and any fragment, then lowercase.
	const normalize = (raw: string): string =>
		raw
			.trim()
			.replace(/^nano:/, '')
			.replace(/#.*$/, '')
			.toLowerCase()

	const go = (candidate: string): boolean => {
		if (!candidate) return false
		if (isValidNanoAddress(candidate)) {
			setError(false)
			router.push(`${prefix}/account/${candidate}` as Route)
			return true
		}
		if (isValidBlockHash(candidate)) {
			setError(false)
			router.push(`${prefix}/block/${candidate}` as Route)
			return true
		}
		return false
	}

	const submit = () => {
		// Enter/button fallback: redirects when valid, shows the error
		// otherwise (a complete address or hash redirects on its own).
		if (!go(normalize(query))) setError(true)
	}

	return (
		<section className="relative mx-auto max-w-2xl rounded-md border border-border bg-card p-5 shadow-xs sm:p-6">
			<RegistrationMarks />

			<div className="flex flex-col gap-3 sm:flex-row">
				<Input
					type="text"
					value={query}
					onChange={(event) => {
						const value = event.target.value
						setQuery(value)
						if (error) setError(false)
						// Auto-redirect as soon as the input is a complete valid
						// address or block hash (paste = instant, typing = on
						// the last character).
						go(normalize(value))
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter') submit()
					}}
					placeholder={t('placeholder')}
					autoComplete="off"
					spellCheck={false}
					autoFocus
					className="font-mono text-sm"
					aria-label={t('placeholder')}
				/>
				<Button type="button" onClick={submit} className="flex-none cursor-pointer">
					<Search className="h-4 w-4" />
					{t('button')}
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			{error && <p className="mt-3 text-sm text-destructive">{t('error')}</p>}

			<div className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
				<span className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 flex-none rounded-full bg-constructive" />
					{t('addressHint')}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 flex-none rounded-full bg-primary" />
					{t('hashHint')}
				</span>
			</div>
		</section>
	)
}
