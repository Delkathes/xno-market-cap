import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'

import { buildNewsQuery, type NewsSort } from '@/lib/news'
import { cn } from '@/lib/utils'

interface NewsFilterBarProps {
	locale: string
	current: URLSearchParams
	tags: string[]
	total: number
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
	return (
		<Link
			href={href}
			aria-current={active ? 'true' : undefined}
			className={cn(
				'rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
				active
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
			)}
		>
			{children}
		</Link>
	)
}

export async function NewsFilterBar({ locale, current, tags, total }: NewsFilterBarProps) {
	const t = await getTranslations({ locale, namespace: 'news' })

	const q = current.get('q') ?? ''
	const selectedTags = (current.get('tag') ?? '').split(',').filter(Boolean)
	const sort = (current.get('sort') as NewsSort | null) ?? 'newest'

	const formAction = getPathname({ href: '/news', locale })
	const allHref = buildNewsQuery(current, { tags: [] }) || '/news'

	const toggleTag = (tag: string) =>
		selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]

	return (
		<div className="space-y-4">
			{/* Search */}
			<form method="GET" action={formAction} className="flex gap-2">
				{selectedTags.length > 0 && <input type="hidden" name="tag" value={selectedTags.join(',')} />}
				{sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
				<div className="relative min-w-0 flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						name="q"
						defaultValue={q}
						placeholder={t('searchPlaceholder')}
						aria-label={t('searchPlaceholder')}
						className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 font-mono text-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-none"
					/>
				</div>
				<button
					type="submit"
					className="shrink-0 rounded-md border border-border bg-card px-4 font-mono text-[11px] uppercase tracking-widest text-foreground transition-colors hover:border-primary/50 hover:text-primary"
				>
					{t('searchButton')}
				</button>
			</form>

			{/* Filters + count */}
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				{tags.length > 0 && (
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
							{t('tagsLabel')}
						</span>
						<FilterChip href={allHref} active={selectedTags.length === 0}>
							{t('allTags')}
						</FilterChip>
						{tags.map((tag) => (
							<FilterChip
								key={tag}
								href={buildNewsQuery(current, { tags: toggleTag(tag) })}
								active={selectedTags.includes(tag)}
							>
								{tag}
							</FilterChip>
						))}
					</div>
				)}

				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{t('sortLabel')}
					</span>
					<FilterChip href={buildNewsQuery(current, { sort: 'newest' })} active={sort === 'newest'}>
						{t('sortNewest')}
					</FilterChip>
					<FilterChip href={buildNewsQuery(current, { sort: 'oldest' })} active={sort === 'oldest'}>
						{t('sortOldest')}
					</FilterChip>
					<FilterChip href={buildNewsQuery(current, { sort: 'title' })} active={sort === 'title'}>
						{t('sortTitle')}
					</FilterChip>
				</div>

				<span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
					{t('resultsCount', { count: total })}
				</span>
			</div>
		</div>
	)
}
