import type { NewsMetadata } from '@/lib/news'
import { formatNewsDate } from '@/lib/news'

const COVER_GRID_STYLE = {
	backgroundImage:
		'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
	backgroundSize: '28px 28px',
} as const

// Terminal-styled cover banner rendered from article metadata — no image files needed.
export function ArticleCover({ article, locale }: { article: NewsMetadata; locale: string }) {
	return (
		<div className="relative mb-8 overflow-hidden rounded-xl border border-border">
			<div className="absolute inset-0 bg-linear-to-br from-[#0d2b45] via-[#0a1f35] to-[#134e6f]" />
			<div aria-hidden="true" className="absolute inset-0 opacity-15" style={COVER_GRID_STYLE} />
			<span
				aria-hidden="true"
				className="absolute right-[-18px] bottom-[-34px] select-none text-[9rem] font-bold leading-none text-white/5"
			>
				Ӿ
			</span>

			<div className="relative flex items-start gap-5 p-6 sm:p-8">
				<div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-4xl sm:h-20 sm:w-20 sm:text-5xl">
					<span>{article.emoji}</span>
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200/70">
						{article.author && <span>{article.author}</span>}
						<span aria-hidden="true" className="text-cyan-200/40">
							{'//'}
						</span>
						<time dateTime={article.date}>{formatNewsDate(article.date, locale)}</time>
						{article.tags && article.tags.length > 0 && (
							<>
								<span aria-hidden="true" className="text-cyan-200/40">
									{'//'}
								</span>
								<span>{article.tags.slice(0, 3).join(' · ')}</span>
							</>
						)}
					</div>
					<h1 className="mt-2 text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
						{article.title}
					</h1>
				</div>
			</div>
		</div>
	)
}

// Compact variant for the news listing cards
export function ArticleCoverThumb({ article }: { article: NewsMetadata }) {
	return (
		<div className="relative mb-4 overflow-hidden rounded-md border border-border">
			<div className="absolute inset-0 bg-linear-to-br from-[#0d2b45] via-[#0a1f35] to-[#134e6f]" />
			<div aria-hidden="true" className="absolute inset-0 opacity-15" style={COVER_GRID_STYLE} />
			<span
				aria-hidden="true"
				className="absolute right-[-8px] bottom-[-16px] select-none text-6xl font-bold leading-none text-white/5"
			>
				Ӿ
			</span>
			<div className="relative flex h-20 items-center justify-center">
				<span className="text-4xl">{article.emoji}</span>
			</div>
		</div>
	)
}
