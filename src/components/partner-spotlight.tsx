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
		<Link href="/partners/info" className="group block">
			<div className="relative overflow-hidden rounded-md border border-green-500 bg-linear-to-r from-green-400/10 via-blue-400/10 to-green-400/10 p-4 shadow-lg transition-all">
				{/* CTA badge */}
				<div className="absolute right-3 top-3">
					<Badge
						variant="default"
						className="gap-1 bg-green-500 font-mono text-[10px] uppercase tracking-widest text-white"
					>
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
						<p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-green-500">
							{t('subtitle')}
						</p>
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
	// 'nano-gpt': {
	// 	en: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT: Pay-as-You-Go AI with Nano',
	// 		description:
	// 			'Access GPT-4, Claude, Gemini, and more with flexible Nano payments. No subscriptions, just pay for what you use.',
	// 	},
	// 	fr: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT : IA à la carte avec Nano',
	// 		description:
	// 			"Accédez à GPT-4, Claude, Gemini et plus avec des paiements Nano flexibles. Pas d'abonnements, payez juste ce que vous utilisez.",
	// 	},
	// 	de: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT: AI nach Bedarf mit Nano',
	// 		description:
	// 			'Zugriff auf GPT-4, Claude, Gemini und mehr mit flexiblen Nano-Zahlungen. Keine Abonnements, zahlen Sie nur, was Sie verwenden.',
	// 	},
	// 	es: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT: IA de pago por uso con Nano',
	// 		description:
	// 			'Accede a GPT-4, Claude, Gemini y más con pagos de Nano flexibles. Sin suscripciones, solo paga por lo que usas.',
	// 	},
	// 	nl: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT: AI naar behoefte met Nano',
	// 		description:
	// 			'Toegang tot GPT-4, Claude, Gemini en meer met flexibele Nano-betalingen. Geen abonnementen, betaal alleen wat je gebruikt.',
	// 	},
	// 	it: {
	// 		partnerName: 'Nano-GPT',
	// 		title: 'Nano-GPT: AI a pagamento con Nano',
	// 		description:
	// 			'Accedi a GPT-4, Claude, Gemini e altri con pagamenti Nano flessibili. Nessun abbonamento, paga solo quello che usi.',
	// 	},
	// },
	// subnano: {
	// 	en: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano: Get Paid When Readers Unlock Your Articles',
	// 		description:
	// 			'Monetize your writing with pay-per-article Nano payments. Instant earnings, zero fees, full audience ownership.',
	// 	},
	// 	fr: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano : Soyez payé quand les lecteurs déverrouillent vos articles',
	// 		description:
	// 			"Monétisez votre écriture avec des paiements Nano par article. Gains instantanés, zéro frais, propriété totale de l'audience.",
	// 	},
	// 	de: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano: Verdienen Sie, wenn Leser Ihre Artikel freigeben',
	// 		description:
	// 			'Monetarisieren Sie Ihr Schreiben mit Nano-Zahlungen pro Artikel. Sofortige Einnahmen, keine Gebühren, vollständiger Publikumsbesitz.',
	// 	},
	// 	es: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano: Gana cuando los lectores desbloquean tus artículos',
	// 		description:
	// 			'Monetiza tu escritura con pagos de Nano por artículo. Ganancias instantáneas, cero comisiones, propiedad total de la audiencia.',
	// 	},
	// 	nl: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano: Verdien wanneer lezers je artikelen ontgrendelen',
	// 		description:
	// 			'Monetariseer je schrijven met Nano-betalingen per artikel. Directe inkomsten, geen kosten, volledig publiekseigendom.',
	// 	},
	// 	it: {
	// 		partnerName: 'SubNano',
	// 		title: 'SubNano: Guadagna quando i lettori sbloccano i tuoi articoli',
	// 		description:
	// 			'Monetizza la tua scrittura con pagamenti Nano per articolo. Guadagni istantanei, zero commissioni, proprietà completa del pubblico.',
	// 	},
	// },
	// 'rpc-nano-to': {
	// 	en: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To: Production-Ready Nano Infrastructure',
	// 		description:
	// 			'Global RPC nodes, GPU proof-of-work, and developer APIs. Free tier with 50K calls/day to build instant payment apps.',
	// 	},
	// 	fr: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To : Infrastructure Nano prête pour la production',
	// 		description:
	// 			'Nœuds RPC mondiaux, preuve de travail GPU et APIs développeur. Tier gratuit avec 50K appels/jour pour construire des apps de paiement instantané.',
	// 	},
	// 	de: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To: Produktionsreife Nano-Infrastruktur',
	// 		description:
	// 			'Globale RPC-Nodes, GPU Proof-of-Work und Entwickler-APIs. Kostenloser Tier mit 50K Aufrufen/Tag zum Erstellen sofortiger Payment-Apps.',
	// 	},
	// 	es: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To: Infraestructura Nano lista para producción',
	// 		description:
	// 			'Nodos RPC globales, prueba de trabajo GPU y APIs de desarrollador. Tier gratuito con 50K llamadas/día para crear apps de pago instantáneo.',
	// 	},
	// 	nl: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To: Productie-klare Nano-infrastructuur',
	// 		description:
	// 			"Globale RPC-nodes, GPU proof-of-work en ontwikkelaars-API's. Gratis tier met 50K aanroepen/dag om directe betaalingsapps te bouwen.",
	// 	},
	// 	it: {
	// 		partnerName: 'RPC.Nano.To',
	// 		title: 'RPC.Nano.To: Infrastruttura Nano pronta per la produzione',
	// 		description:
	// 			'Nodi RPC globali, proof-of-work GPU e API per sviluppatori. Tier gratuito con 50K chiamate/giorno per creare app di pagamento istantaneo.',
	// 	},
	// },
	// nanogotchi: {
	// 	en: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi: Your Virtual Nano Pet',
	// 		description:
	// 			'Raise, breed, and trade digital pets powered by Nano. The blockchain tamagotchi bringing fun to cryptocurrency.',
	// 	},
	// 	fr: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi : Votre Nano Animal Virtuel',
	// 		description:
	// 			'Élevez, reproduisez et échangez des animaux numériques alimentés par Nano. Le tamagotchi blockchain apportant du plaisir aux crypto-monnaies.',
	// 	},
	// 	de: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi: Dein virtuelles Nano-Haustier',
	// 		description:
	// 			'Züchte, vermehre und handele digitale Haustiere, die von Nano angetrieben werden. Das Blockchain-Tamagotchi für Kryptospaß.',
	// 	},
	// 	es: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi: Tu mascota virtual Nano',
	// 		description:
	// 			'Cría, reproduce y comercia mascotas digitales impulsadas por Nano. El tamagotchi blockchain que trae diversión a las criptomonedas.',
	// 	},
	// 	nl: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi: Je virtuele Nano huisdier',
	// 		description:
	// 			'Kweek, vermenigvuldig en handel digitale huisdieren aangedreven door Nano. De blockchain tamagotchi die plezier naar cryptocurrency brengt.',
	// 	},
	// 	it: {
	// 		partnerName: 'Nanogotchi',
	// 		title: 'Nanogotchi: Il tuo animale domestico virtuale Nano',
	// 		description:
	// 			'Alleva, riproduci e scambia animali digitali potenziati da Nano. Il tamagotchi blockchain che porta il divertimento alle criptovalute.',
	// 	},
	// },
	'x402nano-org': {
		en: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: Feeless x402 Facilitator for Nano Payments',
			description:
				'Use a permissionless Nano facilitator for x402 apps and APIs. No signup required: verify and settle HTTP 402 payments in minutes.',
		},
		fr: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org : Facilitateur x402 sans frais pour les paiements Nano',
			description:
				'Utilisez un facilitateur Nano sans permission pour vos apps et APIs x402. Sans inscription : vérifiez et réglez les paiements HTTP 402 en quelques minutes.',
		},
		de: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: Gebührenfreier x402-Facilitator für Nano-Zahlungen',
			description:
				'Nutzen Sie einen permissionless Nano-Facilitator für x402-Apps und APIs. Keine Anmeldung nötig: HTTP-402-Zahlungen in Minuten prüfen und abwickeln.',
		},
		es: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: Facilitador x402 sin comisiones para pagos con Nano',
			description:
				'Usa un facilitador Nano permissionless para apps y APIs x402. Sin registro: verifica y liquida pagos HTTP 402 en minutos.',
		},
		nl: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: Feeloze x402-facilitator voor Nano-betalingen',
			description:
				"Gebruik een permissionless Nano-facilitator voor x402-apps en API's. Geen account nodig: verifieer en settle HTTP 402-betalingen binnen minuten.",
		},
		it: {
			partnerName: 'x402nano.org',
			title: 'x402nano.org: Facilitatore x402 senza commissioni per pagamenti Nano',
			description:
				'Usa un facilitatore Nano permissionless per app e API x402. Nessuna registrazione: verifica e regola i pagamenti HTTP 402 in pochi minuti.',
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
		<div className="relative overflow-hidden rounded-md border border-border bg-muted/30 p-4 transition-all hover:border-primary/40 hover:bg-muted/40">
			{/* Partner badge */}
			<div className="absolute right-3 top-3">
				<Badge
					variant="outline"
					className="gap-1 border-primary/30 font-mono text-[10px] uppercase tracking-widest text-primary"
				>
					<Sparkles className="h-3 w-3" />
					{t('badge')}
				</Badge>
			</div>

			<div className="flex items-start gap-4">
				{/* Logo */}
				{logoUrl && (
					<div className="shrink-0">
						<div className="relative h-12 w-12 overflow-hidden">
							<Image src={logoUrl} alt={partnerName} fill className="object-contain p-1" unoptimized />
						</div>
					</div>
				)}

				{/* Content */}
				<div className="min-w-0 flex-1 pr-20">
					<p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						{partnerName}
					</p>
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
	)
}
