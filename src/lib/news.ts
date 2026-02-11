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
	tags?: string[]
}

export interface NewsArticle extends NewsMetadata {
	content: React.ComponentType
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
		return {
			slug,
			...metadata,
		}
	} catch {
		return null
	}
}

/**
 * Get all news articles metadata for a locale, sorted by date (newest first)
 */
export async function getAllNews(locale: string = DEFAULT_LOCALE): Promise<NewsMetadata[]> {
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
