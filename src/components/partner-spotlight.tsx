'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import {
	getActivePartners,
	getPartnerHref,
	isExternalPartner,
	PARTNER_ROTATION_INTERVAL,
	type PartnerContent,
} from '@/lib/partner-config'
import { getPartnerCopy } from '@/lib/partner-copy'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Mirrors the exact structure and dimensions of the rendered cards so the
// skeleton swaps in without any layout shift (logo 48px + eyebrow + 1-line
// title + 2-line description).
function PartnerCardSkeleton() {
	return (
		<div className="relative overflow-hidden rounded-md border border-border bg-card p-4 sm:p-5">
			<div className="flex items-start gap-4">
				<Skeleton className="h-12 w-12 shrink-0 rounded-md" />
				<div className="min-w-0 flex-1">
					<Skeleton className="mb-1 h-3 w-24" />
					<Skeleton className="mb-1 h-6 w-3/4" />
					<Skeleton className="h-5 w-full" />
					<Skeleton className="mt-1 h-5 w-5/6" />
				</div>
			</div>
		</div>
	)
}

function GetPromotedCard() {
	const t = useTranslations('partners.getPromoted')
	return (
		<Link href="/partners/info" className="group block">
			<div className="relative overflow-hidden rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:p-5">
				{/* Top accent hairline */}
				<div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary/40" />

				{/* CTA badge */}
				<div className="absolute right-3 top-3">
					<Badge variant="default" className="gap-1 font-mono text-[10px] uppercase tracking-widest">
						<Sparkles className="h-3 w-3" />
						{t('badge')}
					</Badge>
				</div>

				<div className="flex items-start gap-4">
					{/* Logo */}
					<div className="shrink-0">
						<div className="grid h-12 w-12 place-items-center rounded-md border border-primary/40 bg-primary/5">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1 pr-8">
						<p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">
							{t('subtitle')}
						</p>
						<h3 className="mb-1 line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
							{t('title')}
						</h3>
						<p className="line-clamp-2 text-sm text-muted-foreground">{t('description')}</p>
					</div>

					{/* Arrow indicator */}
					<div className="absolute bottom-4 right-4 text-muted-foreground transition-colors group-hover:text-primary">
						<ArrowRight className="h-4 w-4" />
					</div>
				</div>
			</div>
		</Link>
	)
}

function PartnerCard({ partner, locale }: { partner: PartnerContent; locale: string }) {
	const { logoUrl } = partner
	const href = getPartnerHref(partner)
	const isExternal = isExternalPartner(partner)

	const { partnerName, title, description } = getPartnerCopy(partner, locale)

	const cardContent = (
		<div className="relative overflow-hidden rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:p-5">
			<div className="flex items-start gap-4">
				{/* Logo */}
				{logoUrl && (
					<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/30">
						<Image src={logoUrl} alt={partnerName} fill className="object-contain p-1.5" unoptimized />
					</div>
				)}

				{/* Content */}
				<div className="min-w-0 flex-1 pr-8">
					<p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{partnerName}
					</p>
					<h3 className="mb-1 line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
						{title}
					</h3>
					<p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
				</div>

				{/* Arrow indicator */}
				<div className="absolute bottom-4 right-4 text-muted-foreground transition-colors group-hover:text-primary">
					{isExternal ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
				</div>
			</div>
		</div>
	)

	if (isExternal) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer partner" className="group block">
				{cardContent}
			</a>
		)
	}

	return (
		<Link href={href} className="group block">
			{cardContent}
		</Link>
	)
}

export function PartnerSpotlight() {
	const locale = useLocale()
	const t = useTranslations('home')
	const [partners, setPartners] = useState<PartnerContent[] | null>(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)

	useEffect(() => {
		setPartners(getActivePartners())
	}, [])

	useEffect(() => {
		if (!partners || isPaused) return

		const totalItems = partners.length + 1 // +1 for GetPromotedCard

		if (totalItems <= 1) return

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % totalItems)
		}, PARTNER_ROTATION_INTERVAL)

		return () => clearInterval(interval)
	}, [partners, isPaused])

	// Section header stays stable across loading and loaded states
	const sectionHeader = (
		<h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
			{t('partnerSection')}
		</h2>
	)

	// Show skeleton while loading
	if (partners === null) {
		return (
			<div className="space-y-3">
				{sectionHeader}
				<PartnerCardSkeleton />
			</div>
		)
	}

	type SpotlightItem = { type: 'partner'; data: PartnerContent } | { type: 'cta' }

	const items: SpotlightItem[] = [
		...partners.map((p) => ({ type: 'partner' as const, data: p })),
		{ type: 'cta' as const },
	]

	// No items to show
	if (items.length === 0) {
		return null
	}

	const currentItem = items[currentIndex]

	return (
		<div className="space-y-3">
			{sectionHeader}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: hover pause is non-essential UX enhancement */}
			<div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
				<div key={`${currentItem.type}-${currentIndex}`} className="animate-in fade-in duration-500">
					{currentItem.type === 'cta' ? (
						<GetPromotedCard />
					) : (
						<PartnerCard partner={currentItem.data} locale={locale} />
					)}
				</div>

				{/* Rotation indicators */}
				{items.length > 1 && (
					<div className="flex justify-center gap-1.5 mt-2">
						{items.map((item, index) => (
							<button
								key={item.type === 'cta' ? 'cta-indicator' : `${item.data.id}-indicator`}
								type="button"
								onClick={() => setCurrentIndex(index)}
								className={`h-1.5 rounded-full transition-all cursor-pointer ${
									index === currentIndex
										? 'w-4 bg-primary'
										: 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
								}`}
								aria-label={`Show item ${index + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
