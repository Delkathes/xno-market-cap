import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { buildNewsHref } from '@/lib/news'
import { cn } from '@/lib/utils'

interface NewsPaginationProps {
	locale: string
	current: URLSearchParams
	currentPage: number
	totalPages: number
}

export async function NewsPagination({ locale, current, currentPage, totalPages }: NewsPaginationProps) {
	const t = await getTranslations({ locale, namespace: 'news' })

	if (totalPages <= 1) {
		return null
	}

	const pageLinks = Array.from({ length: totalPages }, (_, index) => index + 1)

	const navClass =
		'grid h-7 w-7 place-items-center rounded-md border border-border font-mono text-xs transition-colors'
	const idleClass = 'hover:border-primary/50 hover:text-primary'
	const disabledClass = 'cursor-default border-border/50 text-muted-foreground/40'

	return (
		<nav aria-label={t('paginationLabel')} className="flex items-center justify-center gap-1.5 pt-2">
			{currentPage > 1 ? (
				<Link
					href={buildNewsHref(current, { page: currentPage - 1 })}
					className={cn(navClass, idleClass)}
					aria-label={t('prevPage')}
				>
					<ChevronLeft className="h-3.5 w-3.5" />
				</Link>
			) : (
				<span className={cn(navClass, disabledClass)} aria-hidden="true">
					<ChevronLeft className="h-3.5 w-3.5" />
				</span>
			)}

			{pageLinks.map((page) => (
				<Link
					key={page}
					href={buildNewsHref(current, { page })}
					aria-current={page === currentPage ? 'page' : undefined}
					className={cn(
						navClass,
						page === currentPage
							? 'cursor-default border-transparent bg-primary font-bold text-primary-foreground'
							: idleClass,
					)}
				>
					{page}
				</Link>
			))}

			{currentPage < totalPages ? (
				<Link
					href={buildNewsHref(current, { page: currentPage + 1 })}
					className={cn(navClass, idleClass)}
					aria-label={t('nextPage')}
				>
					<ChevronRight className="h-3.5 w-3.5" />
				</Link>
			) : (
				<span className={cn(navClass, disabledClass)} aria-hidden="true">
					<ChevronRight className="h-3.5 w-3.5" />
				</span>
			)}
		</nav>
	)
}
