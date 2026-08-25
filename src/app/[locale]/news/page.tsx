import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { formatNewsDate, getAllNews } from '@/lib/news'

import { ArticleCoverThumb } from '@/components/article-cover'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
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

export default async function NewsPage({ params }: Props) {
	'use cache'
	cacheLife('hours')

	const { locale } = await params

	const t = await getTranslations({ locale, namespace: 'news' })
	const articles = await getAllNews(locale)

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<ModernPageBackground />

			<header className="mb-12 sm:mb-14 animate-fade-in-up">
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('title')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>
			</header>

			{articles.length === 0 ? (
				<div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
					<p>{t('noArticles')}</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article, index) => (
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
		</main>
	)
}
