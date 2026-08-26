import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import { getAllNews, getArticleLocale, getNewsMetadata, getRelatedNews } from '@/lib/news'

import { env } from '@/env'

import { Button } from '@/components/ui/button'
import { ArticleCover } from '@/components/article-cover'
import { ModernPageBackground } from '@/components/modern-page-background'
import { NewsCard } from '@/components/news-card'

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

// Article pages mix cached MDX, a client-side market ticker, and dynamic
// imports, so they cannot be validated as instant-navigation segments.
// Render them as blocking routes (still cached via 'use cache' below).
export const instant = false

export async function generateStaticParams() {
	const articles = await getAllNews()
	const slugs = articles.map((a) => a.slug)
	return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale, slug } = await params
	const article = await getNewsMetadata(slug, locale)

	if (!article) {
		return {}
	}

	const t = await getTranslations({ locale, namespace: 'metadata.news' })
	const ogImage = `${env.NEXT_PUBLIC_SITE_URL}/api/og?slug=${slug}`

	return {
		title: t('articleTitle', { title: article.title }),
		description: article.description,
		openGraph: {
			title: article.title,
			description: article.description,
			url: `/news/${slug}`,
			type: 'article',
			publishedTime: article.date,
			authors: article.author ? [article.author] : undefined,
			images: [
				{
					url: ogImage,
					alt: article.title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: article.title,
			description: article.description,
			images: [ogImage],
		},
		alternates: {
			canonical: `/news/${slug}`,
		},
	}
}

export default async function NewsArticlePage({ params }: Props) {
	'use cache'
	cacheLife('days')

	const { locale, slug } = await params

	const t = await getTranslations({ locale, namespace: 'news' })
	const article = await getNewsMetadata(slug, locale)

	if (!article) {
		notFound()
	}

	// Get the effective locale (falls back to default if article doesn't exist in requested locale)
	const effectiveLocale = getArticleLocale(slug, locale)

	const ogImage = `${env.NEXT_PUBLIC_SITE_URL}/api/og?slug=${slug}`

	// Dynamically import the MDX content
	const { default: Content } = await import(`@content/news/${effectiveLocale}/${slug}.mdx`)

	const relatedArticles = await getRelatedNews(slug, effectiveLocale, 3)

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'NewsArticle',
						headline: article.title,
						description: article.description,
						datePublished: article.date,
						author: article.author ? { '@type': 'Person', name: article.author } : undefined,
						image: ogImage ? `${env.NEXT_PUBLIC_SITE_URL}${ogImage}` : undefined,
						publisher: {
							'@type': 'Organization',
							name: 'NanoMarketCap',
							logo: {
								'@type': 'ImageObject',
								url: `${env.NEXT_PUBLIC_SITE_URL}/X_abstract.svg`,
							},
						},
						mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/news/${slug}`,
						inLanguage: effectiveLocale,
					}),
				}}
			/>

			<div className="mx-auto max-w-3xl animate-fade-in-up">
				{/* Back navigation */}
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 mb-10 cursor-pointer font-mono text-[11px] uppercase tracking-widest"
					asChild
				>
					<Link href="/news">
						<ArrowLeft className="h-3.5 w-3.5 mr-2" />
						{t('backToNews')}
					</Link>
				</Button>

				{/* Article cover */}
				<ArticleCover article={article} locale={locale} />

				{/* Article content */}
				<article className="article-prose">
					<Content />
				</article>

				{/* Related articles */}
				{relatedArticles.length > 0 && (
					<section className="mt-16">
						<h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
							{t('relatedArticles')}
						</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{relatedArticles.map((article, index) => (
								<NewsCard key={article.slug} article={article} locale={locale} index={index} />
							))}
						</div>
					</section>
				)}
			</div>
		</main>
	)
}
