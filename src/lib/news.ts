import { cacheLife } from 'next/cache'

import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'

import fs from 'node:fs'
import path from 'node:path'

export interface NewsMetadata {
	slug: string
	emoji?: string
	title: string
	description: string
	date: string
	author?: string
	image?: string
	ogImage?: string
	tags?: string[]
	/** Must be explicitly set to true to appear publicly. Defaults to unpublished. */
	published?: boolean
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'news')

/**
 * Get the content directory for a specific locale
 */
function getLocaleContentDir(locale: string): string {
	return path.join(CONTENT_DIR, locale)
}

/**
 * Check if a news article exists for a given locale
 */
function articleExistsForLocale(slug: string, locale: string): boolean {
	const filePath = path.join(getLocaleContentDir(locale), `${slug}.mdx`)
	return fs.existsSync(filePath)
}

/**
 * Get the best available locale for an article (requested locale or fallback to default)
 */
export function getArticleLocale(slug: string, requestedLocale: string): string {
	if (articleExistsForLocale(slug, requestedLocale)) {
		return requestedLocale
	}
	// Fallback to default locale (English)
	if (articleExistsForLocale(slug, DEFAULT_LOCALE)) {
		return DEFAULT_LOCALE
	}
	return requestedLocale // Will fail gracefully in getNewsMetadata
}

/**
 * Get all news article slugs for static generation
 * Returns unique slugs across all locales
 */
export function getNewsSlugs(): string[] {
	const slugs = new Set<string>()

	for (const locale of LOCALES) {
		const localeDir = getLocaleContentDir(locale)
		if (!fs.existsSync(localeDir)) continue

		const files = fs.readdirSync(localeDir)
		for (const file of files) {
			if (file.endsWith('.mdx')) {
				slugs.add(file.replace('.mdx', ''))
			}
		}
	}

	return Array.from(slugs)
}

/**
 * Get news metadata from the exported `metadata` object in MDX files
 * Falls back to default locale if article doesn't exist in requested locale
 */
export async function getNewsMetadata(slug: string, locale: string = DEFAULT_LOCALE): Promise<NewsMetadata | null> {
	const effectiveLocale = getArticleLocale(slug, locale)

	try {
		const { metadata } = await import(`@content/news/${effectiveLocale}/${slug}.mdx`)
		if (!metadata.published) return null
		return {
			slug,
			...metadata,
		}
	} catch {
		return null
	}
}

/**
 * Resolve the best social sharing image for a news article.
 * Accepts either `ogImage` (preferred) or `image` for backwards compatibility.
 */
export function getNewsOgImage(article: Pick<NewsMetadata, 'ogImage' | 'image'>): string | undefined {
	return article.ogImage ?? article.image
}

/**
 * Get all news articles metadata for a locale, sorted by date (newest first)
 */
export async function getAllNews(locale: string = DEFAULT_LOCALE): Promise<NewsMetadata[]> {
	'use cache'
	cacheLife('hours')

	const slugs = getNewsSlugs()
	const articles = await Promise.all(slugs.map((slug) => getNewsMetadata(slug, locale)))

	return articles
		.filter((article): article is NewsMetadata => article !== null)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get recent news articles (for banner display)
 */
export async function getRecentNews(locale: string = DEFAULT_LOCALE, count = 3): Promise<NewsMetadata[]> {
	const allNews = await getAllNews(locale)
	return allNews.slice(0, count)
}

/**
 * Get articles related to a given article: shared tags first (highest overlap,
 * then most recent), falling back to the most recent articles when nothing
 * shares a tag. Excludes the article itself.
 */
export async function getRelatedNews(
	slug: string,
	locale: string = DEFAULT_LOCALE,
	count = 3,
): Promise<NewsMetadata[]> {
	const articles = await getAllNews(locale)
	const current = articles.find((article) => article.slug === slug)
	const others = articles.filter((article) => article.slug !== slug)

	if (!current) {
		return others.slice(0, count)
	}

	const currentTags = new Set(current.tags ?? [])
	const scored = others
		.map((article) => ({
			article,
			score: (article.tags ?? []).filter((tag) => currentTags.has(tag)).length,
		}))
		.sort((a, b) => b.score - a.score || new Date(b.article.date).getTime() - new Date(a.article.date).getTime())

	if (scored[0]?.score > 0) {
		return scored.slice(0, count).map((entry) => entry.article)
	}
	return others.slice(0, count)
}

// =============================================================================
// BROWSE ENGINE - search, multi-tag filtering, sorting, pagination
// =============================================================================

export const NEWS_PAGE_SIZE = 9

export type NewsSort = 'newest' | 'oldest' | 'title'

export interface NewsFilters {
	q?: string
	tags?: string[]
	sort?: NewsSort
}

/**
 * Convert raw MDX content into lowercase plain text for searching.
 * Strips the `export const metadata` block and markdown syntax while keeping
 * the actual prose and code content.
 */
export function toSearchText(raw: string): string {
	const metaMatch = raw.match(/^export const metadata = \{[\s\S]*?^\}$/m)
	const body = metaMatch ? raw.slice(metaMatch[0].length) : raw

	return body
		.replace(/```\w*/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, ' ')
		.replace(/[*_]{1,2}([^*_]*)[*_]{1,2}/g, '$1')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/^\s*[-*+]\s+/gm, ' ')
		.replace(/^\s*\d+\.\s+/gm, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase()
}

/**
 * Get the searchable plain-text body of an article (locale-aware fallback).
 */
export function getNewsBodyText(slug: string, locale: string = DEFAULT_LOCALE): string {
	const effectiveLocale = getArticleLocale(slug, locale)
	try {
		const raw = fs.readFileSync(path.join(getLocaleContentDir(effectiveLocale), `${slug}.mdx`), 'utf8')
		return toSearchText(raw)
	} catch {
		return ''
	}
}

/**
 * Searchable bodies for every article slug in a locale, long-lived cached.
 */
export async function getNewsBodies(locale: string = DEFAULT_LOCALE): Promise<Record<string, string>> {
	'use cache'
	cacheLife('hours')

	const bodies: Record<string, string> = {}
	for (const slug of getNewsSlugs()) {
		bodies[slug] = getNewsBodyText(slug, locale)
	}
	return bodies
}

/**
 * Unique tags across the given articles (for the filter chip row).
 */
export function getNewsTags(articles: NewsMetadata[]): string[] {
	const tags = new Set<string>()
	for (const article of articles) {
		for (const tag of article.tags ?? []) {
			tags.add(tag)
		}
	}
	return Array.from(tags).sort()
}

/**
 * Filter and sort articles server-side.
 * - `q`: whitespace-tokenized search; every token must appear in the title,
 *   description, tags, author, slug, or full body text.
 * - `tags`: OR semantics (article must include at least one of the tags).
 * - `sort`: newest (default) | oldest | title (locale-aware).
 */
export function queryNews(
	articles: NewsMetadata[],
	bodies: Record<string, string>,
	filters: NewsFilters,
	locale = 'en',
): NewsMetadata[] {
	const tokens = (filters.q ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)

	const filtered = articles.filter((article) => {
		if (filters.tags?.length && !filters.tags.some((tag) => article.tags?.includes(tag))) {
			return false
		}
		if (tokens.length) {
			const haystack = [
				article.title,
				article.description,
				article.author ?? '',
				article.slug,
				...(article.tags ?? []),
				bodies[article.slug] ?? '',
			]
				.join(' ')
				.toLowerCase()
			if (!tokens.every((token) => haystack.includes(token))) {
				return false
			}
		}
		return true
	})

	const sort = filters.sort ?? 'newest'
	switch (sort) {
		case 'oldest':
			return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		case 'title':
			return filtered.sort((a, b) => a.title.localeCompare(b.title, locale))
		default:
			return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	}
}

/**
 * Paginate a sorted article list.
 */
export function paginateNews(articles: NewsMetadata[], page: number, pageSize = NEWS_PAGE_SIZE) {
	const totalPages = Math.max(1, Math.ceil(articles.length / pageSize))
	const currentPage = Math.min(Math.max(1, page), totalPages)
	const start = (currentPage - 1) * pageSize
	return {
		items: articles.slice(start, start + pageSize),
		currentPage,
		totalPages,
		total: articles.length,
	}
}

export interface NewsQueryOverrides {
	q?: string | null
	tags?: string[] | null
	sort?: NewsSort | null
	page?: number | null
}

/**
 * Build a query string for news browse links, preserving the current filters.
 * Changing any filter (q/tag/sort) resets the page; `page=1` and empty params
 * are omitted for clean URLs.
 */
export function buildNewsQuery(current: URLSearchParams, overrides: NewsQueryOverrides): string {
	const params = new URLSearchParams()

	for (const key of ['q', 'tag', 'sort', 'page'] as const) {
		const value = current.get(key)
		if (value) params.set(key, value)
	}

	if (overrides.q !== undefined) {
		if (overrides.q) params.set('q', overrides.q)
		else params.delete('q')
	}
	if (overrides.tags !== undefined) {
		const nextTags = overrides.tags ?? []
		if (nextTags.length) params.set('tag', nextTags.join(','))
		else params.delete('tag')
	}
	if (overrides.sort !== undefined) {
		if (overrides.sort) params.set('sort', overrides.sort)
		else params.delete('sort')
	}

	const filterChanged = overrides.q !== undefined || overrides.tags !== undefined || overrides.sort !== undefined
	if (filterChanged) {
		params.delete('page')
	} else if (overrides.page !== undefined) {
		if (overrides.page && overrides.page > 1) params.set('page', String(overrides.page))
		else params.delete('page')
	}

	const query = params.toString()
	return query ? `?${query}` : ''
}

/**
 * Format date for display
 */
export function formatNewsDate(dateString: string, locale = 'en'): string {
	const date = new Date(dateString)
	return date.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
