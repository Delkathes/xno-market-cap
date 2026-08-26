'use client'

import { type FormEvent, useRef } from 'react'
import { Search } from 'lucide-react'

import { useRouter } from '@/i18n/navigation'

interface NewsSearchFormProps {
	/** Localized pathname for the no-JS native form action */
	formAction: string
	defaultQ: string
	hiddenTag?: string
	hiddenSort?: string
	placeholder: string
	buttonLabel: string
}

// Search is submitted via client-side navigation (like the filter chips) so
// only the news content updates, not the whole page. The native GET action is
// kept as a progressive-enhancement fallback when JS is unavailable.
export function NewsSearchForm({
	formAction,
	defaultQ,
	hiddenTag,
	hiddenSort,
	placeholder,
	buttonLabel,
}: NewsSearchFormProps) {
	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const query: Record<string, string> = {}
		const q = inputRef.current?.value.trim() ?? ''
		if (q) query.q = q
		if (hiddenTag) query.tag = hiddenTag
		if (hiddenSort) query.sort = hiddenSort
		router.push({ pathname: '/news', query })
	}

	return (
		<form method="GET" action={formAction} onSubmit={handleSubmit} className="flex gap-2" role="search">
			{hiddenTag && <input type="hidden" name="tag" value={hiddenTag} />}
			{hiddenSort && <input type="hidden" name="sort" value={hiddenSort} />}
			<div className="relative min-w-0 flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					key={defaultQ}
					ref={inputRef}
					type="search"
					name="q"
					defaultValue={defaultQ}
					placeholder={placeholder}
					aria-label={placeholder}
					className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 font-mono text-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-none"
				/>
			</div>
			<button
				type="submit"
				className="shrink-0 rounded-md border border-border bg-card px-4 font-mono text-[11px] uppercase tracking-widest text-foreground transition-colors hover:border-primary/50 hover:text-primary"
			>
				{buttonLabel}
			</button>
		</form>
	)
}
