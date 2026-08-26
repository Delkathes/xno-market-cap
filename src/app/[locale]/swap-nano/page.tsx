import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Info } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Appear } from '@/components/ui/appear'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'
import { NanswapIframe } from '@/components/nanswap-widget'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.swapNano' })

	return {
		title: t('title'),
		description: t('description'),
		keywords: [
			'swap to Nano',
			'convert to XNO',
			'Nanswap',
			'crypto swap',
			'exchange to Nano',
			'buy Nano',
			'BTC to XNO',
			'ETH to XNO',
		],
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/swap-nano',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/swap-nano', locale),
		},
	}
}

export default async function SwapNanoPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params

	const t = await getTranslations('swapNano')
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<main className="relative container mx-auto px-4 pt-28 pb-24">
			<HreflangLinks path="/swap-nano" />
			<ModernPageBackground />

			{/* Hero */}
			<section className="relative z-10 max-w-6xl mx-auto mb-14">
				<Appear className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
					<div>
						<h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
							{t('title')}
						</h1>
						<p className="text-muted-foreground text-lg mb-2 max-w-2xl">{t('description1')}</p>
						<p className="text-muted-foreground mb-7 max-w-2xl">{t('description2')}</p>
						<div className="flex items-center gap-3 flex-wrap">
							<Link href="/get-nano" className="text-primary hover:underline text-sm font-medium">
								{t('needWalletFirst')}
							</Link>
						</div>
					</div>

					<div className="relative min-h-80 flex items-center justify-center">
						<svg
							viewBox="0 0 460 300"
							fill="none"
							className="w-full max-w-125 filter-[brightness(0.72)_saturate(1.2)_contrast(1.2)] dark:filter-none"
							aria-hidden="true"
						>
							<defs>
								<linearGradient id="chain-flow" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
									<stop offset="50%" stopColor="#22d3ee" stopOpacity="0.45" />
									<stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
								</linearGradient>
								<linearGradient id="nano-flow" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
									<stop offset="50%" stopColor="#60a5fa" stopOpacity="0.45" />
									<stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
								</linearGradient>
								<filter id="glow-swap" x="-60%" y="-60%" width="220%" height="220%">
									<feGaussianBlur stdDeviation="2" in="SourceGraphic" result="blur" />
									<feMerge>
										<feMergeNode in="blur" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
							</defs>

							<ellipse cx="230" cy="150" rx="180" ry="102" fill="#0ea5e9" fillOpacity="0.06" />
							<ellipse cx="230" cy="150" rx="138" ry="78" fill="#8b5cf6" fillOpacity="0.05" />

							{/* Left blockchain sources */}
							<g>
								<g transform="translate(40, 86)">
									<rect
										x="-12"
										y="-18"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="-8"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="2"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<circle
										cx="30"
										cy="-4"
										r="13"
										fill="#06b6d4"
										fillOpacity="0.2"
										stroke="#22d3ee"
										strokeWidth="1.5"
									/>
									<text
										x="30"
										y="-1"
										textAnchor="middle"
										fill="#22d3ee"
										fontSize="7"
										fontWeight="700"
									>
										BTC
									</text>
								</g>
								<g transform="translate(40, 150)">
									<rect
										x="-12"
										y="-18"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="-8"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="2"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<circle
										cx="30"
										cy="-4"
										r="13"
										fill="#0891b2"
										fillOpacity="0.2"
										stroke="#22d3ee"
										strokeWidth="1.5"
									/>
									<text
										x="30"
										y="-1"
										textAnchor="middle"
										fill="#22d3ee"
										fontSize="7"
										fontWeight="700"
									>
										ETH
									</text>
								</g>
								<g transform="translate(40, 214)">
									<rect
										x="-12"
										y="-18"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="-8"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<rect
										x="-12"
										y="2"
										width="24"
										height="8"
										rx="2"
										fill="hsl(var(--card))"
										stroke="hsl(var(--border))"
									/>
									<circle
										cx="30"
										cy="-4"
										r="13"
										fill="#7c3aed"
										fillOpacity="0.2"
										stroke="#c4b5fd"
										strokeWidth="1.5"
									/>
									<text
										x="30"
										y="-1"
										textAnchor="middle"
										fill="#c4b5fd"
										fontSize="7"
										fontWeight="700"
									>
										USDT
									</text>
								</g>
							</g>

							{/* Input routes to center */}
							<path
								d="M70 82 C132 82, 152 116, 196 136"
								stroke="url(#chain-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>
							<path
								d="M70 146 C130 146, 152 144, 196 146"
								stroke="url(#chain-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>
							<path
								d="M70 210 C132 210, 152 174, 196 154"
								stroke="url(#chain-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>

							{/* Central exchange / server */}
							<g transform="translate(230, 145)">
								<circle
									r="52"
									fill="hsl(var(--card))"
									fillOpacity="0.95"
									stroke="hsl(var(--border))"
									strokeOpacity="0.9"
									strokeWidth="1.4"
								/>
								<rect
									x="-22"
									y="-18"
									width="44"
									height="36"
									rx="8"
									fill="#0f172a"
									fillOpacity="0.35"
									stroke="#7dd3fc"
									strokeOpacity="0.45"
								/>
								<rect x="-14" y="-8" width="28" height="6" rx="3" fill="#67e8f9" fillOpacity="0.3" />
								<circle cx="-8" cy="5" r="2.8" fill="#67e8f9" fillOpacity="0.8" />
								<circle cx="0" cy="5" r="2.8" fill="#93c5fd" fillOpacity="0.8" />
								<circle cx="8" cy="5" r="2.8" fill="#c4b5fd" fillOpacity="0.8" />
								<path
									d="M-16 -26 H10 L4 -32 M16 26 H-10 L-4 32"
									stroke="#e0f2fe"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<animate
										attributeName="stroke-opacity"
										values="0.3;1;0.3"
										dur="1.4s"
										repeatCount="indefinite"
									/>
								</path>
								<circle r="38" fill="none" stroke="#7dd3fc" strokeOpacity="0.28" strokeWidth="1.1">
									<animate attributeName="r" values="32;44;32" dur="2.4s" repeatCount="indefinite" />
									<animate
										attributeName="stroke-opacity"
										values="0.28;0.08;0.28"
										dur="2.4s"
										repeatCount="indefinite"
									/>
								</circle>
							</g>

							{/* Right block-lattice */}
							<g stroke="#60a5fa" strokeOpacity="0.35" strokeWidth="1.2">
								<line x1="312" y1="90" x2="352" y2="90" />
								<line x1="352" y1="90" x2="392" y2="90" />
								<line x1="312" y1="130" x2="352" y2="130" />
								<line x1="352" y1="130" x2="392" y2="130" />
								<line x1="312" y1="170" x2="352" y2="170" />
								<line x1="352" y1="170" x2="392" y2="170" />
								<line x1="312" y1="210" x2="352" y2="210" />
								<line x1="352" y1="210" x2="392" y2="210" />
								<line x1="312" y1="90" x2="312" y2="130" />
								<line x1="312" y1="130" x2="312" y2="170" />
								<line x1="312" y1="170" x2="312" y2="210" />
								<line x1="352" y1="90" x2="352" y2="130" />
								<line x1="352" y1="130" x2="352" y2="170" />
								<line x1="352" y1="170" x2="352" y2="210" />
								<line x1="392" y1="90" x2="392" y2="130" />
								<line x1="392" y1="130" x2="392" y2="170" />
								<line x1="392" y1="170" x2="392" y2="210" />
							</g>
							<g>
								<circle
									cx="312"
									cy="90"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="352"
									cy="90"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="392"
									cy="90"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="312"
									cy="130"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="352"
									cy="130"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="392"
									cy="130"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="312"
									cy="170"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="352"
									cy="170"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="392"
									cy="170"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="312"
									cy="210"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="352"
									cy="210"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
								<circle
									cx="392"
									cy="210"
									r="6"
									fill="#1d4ed8"
									fillOpacity="0.2"
									stroke="#93c5fd"
									strokeWidth="1.2"
								/>
							</g>

							{/* Output routes from center to block-lattice */}
							<path
								className="z-0"
								d="M266 128 C286 122, 292 112, 312 106"
								stroke="url(#nano-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>
							<path
								className="z-0"
								d="M266 145 C286 142, 292 148, 312 145"
								stroke="url(#nano-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>
							<path
								className="z-0"
								d="M266 162 C286 168, 292 178, 312 184"
								stroke="url(#nano-flow)"
								strokeWidth="2.2"
								strokeLinecap="round"
								fill="none"
							/>

							{/* Inbound coins */}
							<g filter="url(#glow-swap)" className="z-10">
								<g opacity="0">
									<animateMotion
										path="M70 82 C132 82, 152 116, 196 136"
										dur="2.2s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="2.2s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#06b6d4"
										fillOpacity="0.22"
										stroke="#22d3ee"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="3" fill="#22d3ee" fontSize="6.2" fontWeight="700">
										BTC
									</text>
								</g>
								<g opacity="0">
									<animateMotion
										path="M70 146 C130 146, 152 144, 196 146"
										dur="2.3s"
										begin="0.65s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="2.3s"
										begin="0.65s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#0891b2"
										fillOpacity="0.22"
										stroke="#22d3ee"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="3" fill="#22d3ee" fontSize="6.2" fontWeight="700">
										ETH
									</text>
								</g>
								<g opacity="0">
									<animateMotion
										path="M70 210 C132 210, 152 174, 196 154"
										dur="2.35s"
										begin="1.15s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="2.35s"
										begin="1.15s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#7c3aed"
										fillOpacity="0.22"
										stroke="#c4b5fd"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="3" fill="#c4b5fd" fontSize="6.2" fontWeight="700">
										USDT
									</text>
								</g>
							</g>

							{/* Outbound XNO */}
							<g filter="url(#glow-swap)">
								<g opacity="0">
									<animateMotion
										path="M266 128 C286 122, 292 112, 312 106"
										dur="1.9s"
										begin="0.45s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="1.9s"
										begin="0.45s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#2563eb"
										fillOpacity="0.22"
										stroke="#93c5fd"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="2" fill="#93c5fd" fontSize="6.2" fontWeight="700">
										XNO
									</text>
								</g>
								<g opacity="0">
									<animateMotion
										path="M266 145 C286 142, 292 148, 312 145"
										dur="1.95s"
										begin="1.0s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="1.95s"
										begin="1.0s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#2563eb"
										fillOpacity="0.22"
										stroke="#93c5fd"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="2" fill="#93c5fd" fontSize="6.2" fontWeight="700">
										XNO
									</text>
								</g>
								<g opacity="0">
									<animateMotion
										path="M266 162 C286 168, 292 178, 312 184"
										dur="2s"
										begin="1.45s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.14;0.86;1"
										dur="2s"
										begin="1.45s"
										repeatCount="indefinite"
									/>
									<circle
										r="10"
										fill="#2563eb"
										fillOpacity="0.22"
										stroke="#93c5fd"
										strokeWidth="1.2"
									/>
									<text textAnchor="middle" dy="2" fill="#93c5fd" fontSize="6.2" fontWeight="700">
										XNO
									</text>
								</g>
							</g>
						</svg>
					</div>
				</Appear>
			</section>

			{/* Swap Section */}
			<Appear delay={110} className="relative z-10 max-w-5xl mx-auto mb-12">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold mb-3">{t('swapWithNanswap')}</h2>
					<p className="text-muted-foreground max-w-xl mx-auto">{t('nanswapDescription')}</p>
				</div>

				<NanswapIframe />
			</Appear>

			{/* Disclaimer */}
			<Appear delay={200} className="relative z-10">
				<Alert className="max-w-3xl mx-auto border-primary/20 bg-card/70 backdrop-blur-xl">
					<Info className="h-4 w-4" />
					<AlertDescription>
						{t('disclaimer')}
						<span className="block mt-1 text-xs text-muted-foreground/70">
							{tDisclaimer('affiliateDisclosure')}
						</span>
					</AlertDescription>
				</Alert>
			</Appear>
		</main>
	)
}
