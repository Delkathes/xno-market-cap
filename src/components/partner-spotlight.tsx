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
	const t = useTranslations('partners.getPromoted')
	return (
		<Link href="/partners/info" className="group block" prefetch={false}>
			<div className="relative overflow-hidden rounded-lg border border-green-500 bg-linear-to-r from-green-400/10 via-blue-400/10 to-green-400/10 p-4 shadow-lg transition-all">
				{/* CTA badge */}
				<div className="absolute right-3 top-3">
					<Badge variant="default" className="gap-1 text-xs bg-green-500 text-white">
						<Sparkles className="h-3 w-3" />
						{t('badge')}
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
						<p className="mb-0.5 text-xs text-green-500">{t('subtitle')}</p>
						<h3 className="mb-1 font-semibold text-green-600 group-hover:text-green-400 transition-colors line-clamp-1">
							{t('title')}
						</h3>
						<p className="text-sm text-green-600 line-clamp-2">{t('description')}</p>
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

// Partner content translations - hardcoded for business content isolation
const partnerTranslations: Record<
	string,
	Record<string, { partnerName: string; title: string; description: string }>
> = {
	nanobrowser: {
		en: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser: Earn Nano While You Browse',
			description:
				'The privacy-focused browser that rewards you with XNO for your attention. No tracking, no ads, just Nano.',
		},
		fr: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser : Gagnez Nano en Naviguant',
			description:
				'Le navigateur axé sur la confidentialité qui vous récompense avec du XNO pour votre attention. Pas de suivi, pas de publicités, juste Nano.',
		},
		de: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser: Verdienen Sie Nano beim Surfen',
			description:
				'Der datenschutzorientierte Browser, der Sie mit XNO für Ihre Aufmerksamkeit belohnt. Kein Tracking, keine Werbung, nur Nano.',
		},
		es: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser: Gana Nano Mientras Navegas',
			description:
				'El navegador enfocado en la privacidad que te recompensa con XNO por tu atención. Sin rastreo, sin anuncios, solo Nano.',
		},
		nl: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser: Verdien Nano Tijdens het Browsen',
			description:
				'De privacy-gerichte browser die je beloont met XNO voor je aandacht. Geen tracking, geen advertenties, alleen Nano.',
		},
		it: {
			partnerName: 'NanoBrowser',
			title: 'NanoBrowser: Guadagna Nano Mentre Navighi',
			description:
				'Il browser incentrato sulla privacy che ti ricompensa con XNO per la tua attenzione. Nessun tracciamento, nessuna pubblicità, solo Nano.',
		},
	},
	nanostore: {
		en: {
			partnerName: 'NanoStore',
			title: 'Shop With Nano - 10,000+ Products',
			description:
				'The largest marketplace accepting Nano payments. Electronics, clothing, gifts and more with instant checkout.',
		},
		fr: {
			partnerName: 'NanoStore',
			title: 'Achetez avec Nano - 10 000+ Produits',
			description:
				'Le plus grand marketplace acceptant les paiements Nano. Électronique, vêtements, cadeaux et plus avec paiement instantané.',
		},
		de: {
			partnerName: 'NanoStore',
			title: 'Mit Nano Einkaufen - 10.000+ Produkte',
			description:
				'Der größte Marketplace, der Nano-Zahlungen akzeptiert. Elektronik, Kleidung, Geschenke und mehr mit sofortiger Kasse.',
		},
		es: {
			partnerName: 'NanoStore',
			title: 'Compra con Nano - 10.000+ Productos',
			description:
				'El marketplace más grande que acepta pagos Nano. Electrónica, ropa, regalos y más con pago instantáneo.',
		},
		nl: {
			partnerName: 'NanoStore',
			title: 'Winkel met Nano - 10.000+ Producten',
			description:
				'De grootste marketplace die Nano-betalingen accepteert. Elektronica, kleding, cadeaus en meer met directe checkout.',
		},
		it: {
			partnerName: 'NanoStore',
			title: 'Acquista con Nano - 10.000+ Prodotti',
			description:
				'Il marketplace più grande che accetta pagamenti Nano. Elettronica, abbigliamento, regali e altro con pagamento istantaneo.',
		},
	},
}

function PartnerCard({ partner, locale }: { partner: PartnerContent; locale: string }) {
	const t = useTranslations('partners')
	const { id, logoUrl } = partner
	const href = getPartnerHref(partner)
	const isExternal = isExternalPartner(partner)

	// Get partner content from hardcoded translations
	const partnerContent = partnerTranslations[id]?.[locale] || partnerTranslations[id]?.en
	if (!partnerContent) {
		return null
	}

	const { partnerName, title, description } = partnerContent

	const cardContent = (
		<div className="relative overflow-hidden rounded-lg border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-4 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
			{/* Partner badge */}
			<div className="absolute right-3 top-3">
				<Badge variant="outline" className="gap-1 border-primary/30 text-xs text-primary">
					<Sparkles className="h-3 w-3" />
					{t('badge')}
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
	const locale = useLocale()
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
