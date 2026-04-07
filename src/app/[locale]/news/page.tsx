import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Calendar, ChevronRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { formatNewsDate, getAllNews } from '@/lib/news'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('hours')

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
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'news' })
	const articles = await getAllNews(locale)

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
				<p className="text-muted-foreground">{t('subtitle')}</p>
			</div>

			{articles.length === 0 ? (
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-center">{t('noArticles')}</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<Link key={article.slug} href={`/news/${article.slug}`}>
							<Card className="h-full transition-colors hover:bg-muted/50">
								<CardHeader className="grow">
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
										<Calendar className="w-4 h-4" />
										<time dateTime={article.date}>{formatNewsDate(article.date, locale)}</time>
									</div>
									<CardTitle className="line-clamp-2 leading-tight">{article.title}</CardTitle>
									<CardDescription className="line-clamp-3">{article.description}</CardDescription>
								</CardHeader>
								<CardContent className="pb-4 flex items-center justify-between">
									{article.tags && article.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{article.tags.slice(0, 3).map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									)}
									<div className="flex items-center text-sm text-accent font-medium">
										{t('readMore')}
										<ChevronRight className="w-4 h-4 ml-1" />
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</main>
	)
}
