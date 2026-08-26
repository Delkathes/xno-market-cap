import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'

import { buildNewsHref, type NewsSort } from '@/lib/news'
import { cn } from '@/lib/utils'

import { NewsSearchForm } from '@/components/news-search-form'

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
	const allHref = buildNewsHref(current, { tags: [] })

	const toggleTag = (tag: string) =>
		selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]

	return (
		<div className="space-y-4">
			{/* Search */}
			<NewsSearchForm
				formAction={formAction}
				defaultQ={q}
				hiddenTag={selectedTags.length > 0 ? selectedTags.join(',') : undefined}
				hiddenSort={sort !== 'newest' ? sort : undefined}
				placeholder={t('searchPlaceholder')}
				buttonLabel={t('searchButton')}
			/>

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
								href={buildNewsHref(current, { tags: toggleTag(tag) })}
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
					<FilterChip href={buildNewsHref(current, { sort: 'newest' })} active={sort === 'newest'}>
						{t('sortNewest')}
					</FilterChip>
					<FilterChip href={buildNewsHref(current, { sort: 'oldest' })} active={sort === 'oldest'}>
						{t('sortOldest')}
					</FilterChip>
					<FilterChip href={buildNewsHref(current, { sort: 'title' })} active={sort === 'title'}>
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
