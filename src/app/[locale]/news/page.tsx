import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import {
	formatNewsDate,
	getAllNews,
	getNewsBodies,
	getNewsTags,
	NEWS_PAGE_SIZE,
	type NewsSort,
	paginateNews,
	queryNews,
} from '@/lib/news'

import { Skeleton } from '@/components/ui/skeleton'
import { ArticleCoverThumb } from '@/components/article-cover'
import { ModernPageBackground } from '@/components/modern-page-background'
import { NewsFilterBar } from '@/components/news-filter-bar'
import { NewsPagination } from '@/components/news-pagination'

type Props = {
	params: Promise<{ locale: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

const NEWS_SORTS: NewsSort[] = ['newest', 'oldest', 'title']

function getParam(searchParams: Record<string, string | string[] | undefined>, key: string): string {
	const value = searchParams[key]
	if (Array.isArray(value)) return value[0] ?? ''
	return value ?? ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.news' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/news',
		},
		alternates: {
			canonical: '/news',
		},
	}
}

export default async function NewsPage({ params, searchParams }: Props) {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'news' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			<header className="mb-8 animate-fade-in-up sm:mb-10">
				<h1 className="text-4xl font-bold tracking-tight text-balance mb-3 md:text-5xl">{t('title')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
			</header>

			<Suspense fallback={<NewsBrowseSkeleton />}>
				<NewsBrowse locale={locale} searchParams={searchParams} />
			</Suspense>
		</main>
	)
}

// Dynamic part of the page: reads searchParams inside Suspense so the shell
// above can stay prerendered (search-driven routes can't be fully static).
async function NewsBrowse({ locale, searchParams }: { locale: string; searchParams: Props['searchParams'] }) {
	const searchParamsResolved = await searchParams
	const t = await getTranslations({ locale, namespace: 'news' })

	// Parse + validate URL params
	const q = getParam(searchParamsResolved, 'q').trim().slice(0, 80)
	const tags = getParam(searchParamsResolved, 'tag')
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean)
		.slice(0, 8)
	const rawSort = getParam(searchParamsResolved, 'sort')
	const sort: NewsSort = NEWS_SORTS.includes(rawSort as NewsSort) ? (rawSort as NewsSort) : 'newest'
	const rawPage = Number.parseInt(getParam(searchParamsResolved, 'page'), 10)
	const page = Number.isFinite(rawPage) ? rawPage : 1

	const current = new URLSearchParams()
	if (q) current.set('q', q)
	if (tags.length) current.set('tag', tags.join(','))
	if (sort !== 'newest') current.set('sort', sort)
	if (page > 1) current.set('page', String(page))

	// Server-side browse pipeline
	const [articles, bodies] = await Promise.all([getAllNews(locale), getNewsBodies(locale)])
	const filtered = queryNews(articles, bodies, { q, tags, sort }, locale)
	const { items, currentPage, totalPages, total } = paginateNews(filtered, page, NEWS_PAGE_SIZE)

	const hasActiveFilters = q.length > 0 || tags.length > 0
	const empty = items.length === 0

	return (
		<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
			<div className="mb-8">
				<NewsFilterBar locale={locale} current={current} tags={getNewsTags(articles)} total={total} />
			</div>

			{empty ? (
				<div
					className="animate-fade-in-up rounded-md border bg-card p-10 text-center"
					style={{ animationDelay: '160ms' }}
				>
					<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{articles.length === 0 ? t('noArticles') : t('noResults')}
					</p>
					{articles.length > 0 && (
						<p className="mt-3 text-sm text-muted-foreground">{t('noResultsDescription')}</p>
					)}
					{hasActiveFilters && (
						<Link
							href="/news"
							className="mt-5 inline-block rounded-md border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:border-primary/50 hover:text-primary"
						>
							{t('clearFilters')}
						</Link>
					)}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((article, index) => (
						<Link
							key={article.slug}
							href={`/news/${article.slug}`}
							className="animate-fade-in-up"
							style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
						>
							<article className="group flex h-full flex-col rounded-md border bg-card p-4 transition-colors hover:border-primary/40">
								<ArticleCoverThumb article={article} />
								<div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
									<span className="flex items-center gap-2">
										{article.emoji && <span className="text-sm leading-none">{article.emoji}</span>}
										<time dateTime={article.date}>{formatNewsDate(article.date, locale)}</time>
									</span>
									<span aria-hidden="true" className="text-[#209CE9]">
										Ӿ
									</span>
								</div>
								<h2 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
									{article.title}
								</h2>
								<p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
									{article.description}
								</p>
								<div className="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-border pt-3">
									{article.tags && article.tags.length > 0 && (
										<div className="flex flex-wrap gap-1.5">
											{article.tags.slice(0, 3).map((tag) => (
												<span
													key={tag}
													className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
												>
													{tag}
												</span>
											))}
										</div>
									)}
									<span className="ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[#209CE9]">
										{t('readMore')}
										<ChevronRight className="h-3 w-3" />
									</span>
								</div>
							</article>
						</Link>
					))}
				</div>
			)}

			<NewsPagination locale={locale} current={current} currentPage={currentPage} totalPages={totalPages} />
		</div>
	)
}

// Mirrors the filter bar + card grid structure so streaming in does not jump
function NewsBrowseSkeleton() {
	return (
		<div>
			<div className="mb-8 space-y-4">
				<div className="flex gap-2">
					<Skeleton className="h-9.5 flex-1 rounded-md" />
					<Skeleton className="h-9.5 w-24 rounded-md" />
				</div>
				<div className="flex flex-wrap items-center gap-1.5">
					<Skeleton className="h-3.5 w-10" />
					<Skeleton className="h-5.5 w-12 rounded" />
					<Skeleton className="h-5.5 w-16 rounded" />
					<Skeleton className="h-5.5 w-14 rounded" />
					<Skeleton className="h-5.5 w-10 rounded" />
					<Skeleton className="ml-auto h-3.5 w-20" />
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((card) => (
					<div key={card} className="rounded-md border bg-card p-4">
						<Skeleton className="h-4 w-32" />
						<div className="mt-3 flex items-center justify-between">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-3" />
						</div>
						<Skeleton className="mt-3 h-5 w-full" />
						<Skeleton className="mt-2 h-5 w-4/5" />
						<Skeleton className="mt-2 h-3.5 w-full" />
						<Skeleton className="mt-1 h-3.5 w-2/3" />
						<div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-3">
							<Skeleton className="h-3.5 w-16 rounded" />
							<Skeleton className="h-3.5 w-16" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
