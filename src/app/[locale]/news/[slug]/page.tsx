import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import { formatNewsDate, getAllNews, getArticleLocale, getNewsMetadata, getNewsOgImage } from '@/lib/news'

import { env } from '@/env'

import { Button } from '@/components/ui/button'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

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
	const ogImage = getNewsOgImage(article)

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
			images: ogImage
				? [
						{
							url: ogImage,
							alt: article.title,
						},
					]
				: undefined,
		},
		twitter: ogImage
			? {
					card: 'summary_large_image',
					title: article.title,
					description: article.description,
					images: [ogImage],
				}
			: undefined,
		alternates: {
			canonical: `/news/${slug}`,
		},
	}
}

export default async function NewsArticlePage({ params }: Props) {
	'use cache'
	cacheLife('days')

	const { locale, slug } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'news' })
	const article = await getNewsMetadata(slug, locale)

	if (!article) {
		notFound()
	}

	// Get the effective locale (falls back to default if article doesn't exist in requested locale)
	const effectiveLocale = getArticleLocale(slug, locale)

	const ogImage = getNewsOgImage(article)

	// Dynamically import the MDX content
	const { default: Content } = await import(`@content/news/${effectiveLocale}/${slug}.mdx`)

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			<script
				type="application/ld+json"
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

				{/* Article header */}
				<header className="mb-10">
					<div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
						{article.emoji && <span className="text-base leading-none">{article.emoji}</span>}
						<time dateTime={article.date}>{formatNewsDate(article.date, locale)}</time>
						{article.author && (
							<>
								<span className="text-muted-foreground/40">{'//'}</span>
								<span>{article.author}</span>
							</>
						)}
					</div>
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-5">{article.title}</h1>

					{article.tags && article.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{article.tags.map((tag) => (
								<span
									key={tag}
									className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</header>

				{/* Article content */}
				<article className="article-prose">
					<Content />
				</article>
			</div>
		</main>
	)
}
