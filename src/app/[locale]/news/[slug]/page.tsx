import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import { formatNewsDate, getArticleLocale, getNewsMetadata, getNewsSlugs } from '@/lib/news'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
	params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
	const slugs = getNewsSlugs()
	return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

// export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params
	const article = await getNewsMetadata(slug, locale)

	if (!article) {
		return {}
	}

	const t = await getTranslations({ locale, namespace: 'metadata.news' })

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
		},
		alternates: {
			canonical: `/news/${slug}`,
		},
	}
}

export default async function NewsArticlePage({ params }: Props) {
	const { locale, slug } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'news' })
	const article = await getNewsMetadata(slug, locale)

	if (!article) {
		notFound()
	}

	// Get the effective locale (falls back to default if article doesn't exist in requested locale)
	const effectiveLocale = getArticleLocale(slug, locale)

	// Dynamically import the MDX content
	const { default: Content } = await import(`@content/news/${effectiveLocale}/${slug}.mdx`)

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="max-w-3xl mx-auto">
				{/* Back navigation */}
				<Link href="/news">
					<Button variant="ghost" size="sm" className="mb-6 -ml-2">
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t('backToNews')}
					</Button>
				</Link>

				{/* Article header */}
				<header className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{article.title}</h1>

					<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							<time dateTime={article.date}>{formatNewsDate(article.date, locale)}</time>
						</div>
						{article.author && (
							<div className="flex items-center gap-2">
								<User className="w-4 h-4" />
								<span>{article.author}</span>
							</div>
						)}
					</div>

					{article.tags && article.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{article.tags.map((tag) => (
								<Badge key={tag} variant="secondary">
									{tag}
								</Badge>
							))}
						</div>
					)}
				</header>

				{/* Article content */}
				<article className="prose-custom">
					<Content />
				</article>

				{/* Footer navigation */}
				<footer className="mt-12 pt-6 border-t border-border">
					<Link href="/news">
						<Button variant="outline">
							<ArrowLeft className="w-4 h-4 mr-2" />
							{t('backToNews')}
						</Button>
					</Link>
				</footer>
			</div>
		</main>
	)
}
