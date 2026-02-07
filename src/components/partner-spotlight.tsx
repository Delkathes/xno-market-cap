'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'

import { Link } from '@/i18n/navigation'

import {
	getActivePartners,
	getPartnerHref,
	isExternalPartner,
	PARTNER_ROTATION_INTERVAL,
	type PartnerContent,
} from '@/lib/partner-config'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function PartnerCardSkeleton() {
	return (
		<div className="relative overflow-hidden rounded-lg border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-4 mb-7.5">
			<div className="flex items-start gap-4">
				<Skeleton className="h-12 w-12 rounded-lg shrink-0" />
				<div className="min-w-0 flex-1 pr-20">
					<Skeleton className="h-3 w-20 mb-1.75" />
					<Skeleton className="h-5 w-3/4 mb-2.75" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full mt-1 sm:hidden" />
				</div>
			</div>
		</div>
	)
}

function GetPromotedCard() {
	return (
		<Link href="/partners/info" className="group block" prefetch={false}>
			<div className="relative overflow-hidden rounded-lg border border-green-500 bg-linear-to-r from-green-400/10 via-blue-400/10 to-green-400/10 p-4 shadow-lg transition-all">
				{/* CTA badge */}
				<div className="absolute right-3 top-3">
					<Badge variant="default" className="gap-1 text-xs bg-green-500 text-white">
						<Sparkles className="h-3 w-3" />
						Get Promoted
					</Badge>
				</div>

				<div className="flex items-start gap-4">
					{/* Logo */}
					<div className="shrink-0">
						<div className="relative h-12 w-12 overflow-hidden rounded-lg shadow-sm items-center justify-center flex border border-green-400">
							<Sparkles className="h-8 w-8 text-green-400" />
						</div>
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1 pr-20">
						<p className="mb-0.5 text-xs text-green-500">Your Business Here</p>
						<h3 className="mb-1 font-semibold text-green-600 group-hover:text-green-400 transition-colors line-clamp-1">
							Get Promoted!
						</h3>
						<p className="text-sm text-green-600 line-clamp-2">
							Feature your business in this spotlight. Reach thousands of Nano users. Click to learn more.
						</p>
					</div>

					{/* Arrow indicator */}
					<div className="absolute bottom-4 right-4 text-muted-foreground group-hover:text-primary transition-colors">
						<ArrowRight className="h-4 w-4" />
					</div>
				</div>
			</div>
		</Link>
	)
}

function PartnerCard({ partner }: { partner: PartnerContent }) {
	const { partnerName, title, description, logoUrl } = partner
	const href = getPartnerHref(partner)
	const isExternal = isExternalPartner(partner)

	const cardContent = (
		<div className="relative overflow-hidden rounded-lg border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-4 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
			{/* Partner badge */}
			<div className="absolute right-3 top-3">
				<Badge variant="outline" className="gap-1 border-primary/30 text-xs text-primary">
					<Sparkles className="h-3 w-3" />
					Partner
				</Badge>
			</div>

			<div className="flex items-start gap-4">
				{/* Logo */}
				{logoUrl && (
					<div className="shrink-0">
						<div className="relative h-12 w-12 overflow-hidden rounded-lg bg-background shadow-sm">
							<Image src={logoUrl} alt={partnerName} fill className="object-contain p-1" />
						</div>
					</div>
				)}

				{/* Content */}
				<div className="min-w-0 flex-1 pr-20">
					<p className="mb-0.5 text-xs text-muted-foreground">{partnerName}</p>
					<h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
						{title}
					</h3>
					<p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
				</div>

				{/* Arrow indicator */}
				<div className="absolute bottom-4 right-4 text-muted-foreground group-hover:text-primary transition-colors">
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

	// Show skeleton while loading
	if (partners === null) {
		return (
			<div className="mt-4">
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
		// biome-ignore lint/a11y/noStaticElementInteractions: hover pause is non-essential UX enhancement
		<div className="mt-4" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
			<div key={`${currentItem.type}-${currentIndex}`} className="animate-in fade-in duration-500">
				{currentItem.type === 'cta' ? <GetPromotedCard /> : <PartnerCard partner={currentItem.data} />}
			</div>

			{/* Rotation indicators */}
			{items.length > 1 && (
				<div className="flex justify-center gap-1.5 mt-2">
					{items.map((item, index) => (
						<button
							key={item.type === 'cta' ? 'cta-indicator' : `${item.data.id}-indicator`}
							type="button"
							onClick={() => setCurrentIndex(index)}
							className={`h-1.5 rounded-full transition-all ${
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
	)
}
