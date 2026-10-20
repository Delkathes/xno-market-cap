'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import type { NewsMetadata } from '@/lib/news'

interface NewsBannerProps {
	articles: NewsMetadata[]
}

export function NewsBanner({ articles }: NewsBannerProps) {
	const t = useTranslations('news')

	if (articles.length === 0) {
		return null
	}

	const renderItems = () =>
		articles.map((article) => (
			<li key={article.slug} className="flex shrink-0 items-center">
				<Link
					href={`/news/${article.slug}`}
					className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					<span aria-hidden="true">{article.emoji}</span>
					<span className="tracking-wide">{article.title}</span>
				</Link>
			</li>
		))

	return (
		<div className="ticker-tape flex items-stretch overflow-hidden rounded-md border border-border bg-muted/40">
			{/* Label */}
			<Link
				href="/news"
				className="group relative z-10 flex shrink-0 items-center gap-2 border-r border-border bg-card/60 px-3"
			>
				<span aria-hidden="true" className="relative flex h-1.5 w-1.5">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
					<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
				</span>
				<span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground group-hover:text-primary">
					{t('latestNews')}
				</span>
			</Link>

			{/* Tape */}
			<div className="relative flex-1 overflow-hidden motion-reduce:overflow-x-auto">
				<div className="flex w-max animate-marquee">
					<ul className="flex items-center">{renderItems()}</ul>
					<ul aria-hidden="true" inert className="flex items-center motion-reduce:hidden">
						{renderItems()}
					</ul>
				</div>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background/70 to-transparent"
				/>
			</div>
		</div>
	)
}
