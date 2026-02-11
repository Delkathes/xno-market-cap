'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Link } from '@/i18n/navigation'

import type { NewsMetadata } from '@/lib/news'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NewsBannerProps {
	articles: NewsMetadata[]
}

export function NewsBanner({ articles }: NewsBannerProps) {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	const checkScroll = useCallback(() => {
		const el = scrollRef.current
		if (!el) return

		setCanScrollLeft(el.scrollLeft > 0)
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
	}, [])

	useEffect(() => {
		checkScroll()
		window.addEventListener('resize', checkScroll)
		return () => window.removeEventListener('resize', checkScroll)
	}, [checkScroll])

	const scroll = (direction: 'left' | 'right') => {
		const el = scrollRef.current
		if (!el) return

		const scrollAmount = 200
		el.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		})
	}

	if (articles.length === 0) {
		return null
	}

	return (
		<div className="relative flex items-center mt-4">
			{canScrollLeft && (
				<div className="absolute left-0 z-10 flex items-center h-full">
					<div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/80 to-transparent pointer-events-none" />
					<Button
						variant="ghost"
						size="icon"
						className="relative h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
						onClick={() => scroll('left')}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				</div>
			)}

			<div
				ref={scrollRef}
				onScroll={checkScroll}
				className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
			>
				{articles.map((article) => (
					<Link key={article.slug} href={`/news/${article.slug}`}>
						<Badge
							variant="outline"
							className="whitespace-nowrap hover:bg-accent hover:border-accent hover:text-primary-foreground dark:hover:text-foreground transition-colors cursor-pointer px-4 py-2 rounded-full"
						>
							<span className="mr-0.5">{article.emoji}</span>
							{article.title}
						</Badge>
					</Link>
				))}
			</div>

			{canScrollRight && (
				<div className="absolute right-0 z-10 flex items-center justify-end h-full">
					<div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/80 to-transparent pointer-events-none" />
					<Button
						variant="ghost"
						size="icon"
						className="relative h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
						onClick={() => scroll('right')}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	)
}
