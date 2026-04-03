import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { ArrowRightLeft, Building2, Droplets, ExternalLink, Info, Monitor, Shield, Smartphone } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Appear } from '@/components/ui/appear'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.getNano' })

	return {
		title: t('title'),
		description: t('description'),
		keywords: [
			'Nano wallet',
			'XNO wallet',
			'Natrium',
			'Nautilus',
			'Nault',
			'buy Nano',
			'get XNO',
			'Nano exchange',
			'Nano faucet',
		],
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/get-nano',
		},
		alternates: {
			canonical: '/get-nano',
		},
	}
}

export default async function GetNanoPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations('getNano')

	const walletSections = [
		{
			key: 'mobile',
			icon: Smartphone,
			title: t('mobile'),
			description: t('mobileDescription'),
			links: [
				{ label: 'Natrium', href: 'https://natrium.io' },
				{ label: 'Nautilus', href: 'https://nautilus.io' },
				{ label: 'Cake Wallet', href: 'https://cakewallet.com' },
			],
		},
		{
			key: 'desktop',
			icon: Monitor,
			title: t('desktopWeb'),
			description: t('desktopWebDescription'),
			links: [
				{ label: 'Nault.cc', href: 'https://nault.cc' },
				{ label: 'Cake Wallet', href: 'https://cakewallet.com' },
			],
		},
		{
			key: 'hardware',
			icon: Shield,
			title: t('hardware'),
			description: t('hardwareDescription'),
			links: [{ label: t('ledgerViaNault'), href: 'https://nault.cc' }],
		},
	] as const

	const acquisitionSections = [
		{ key: 'exchanges', icon: Building2, title: t('exchanges'), description: t('exchangesDescription') },
		{
			key: 'swaps',
			icon: ArrowRightLeft,
			title: t('swapServices'),
			description: t('swapServicesDescription'),
		},
		{ key: 'faucets', icon: Droplets, title: t('faucets'), description: t('faucetsDescription') },
	] as const

	return (
		<main className="relative container mx-auto px-4 pt-28 pb-24">
			<ModernPageBackground />

			{/* Hero */}
			<section className="relative z-10 max-w-6xl mx-auto mb-20">
				<Appear className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
					<div className="relative">
						<div className="relative z-10">
							<h1 className="text-4xl md:text-5xl font-bold mb-5 text-balance">
								<span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
									{t('title')}
								</span>
							</h1>
							<p className="text-muted-foreground text-lg mb-2 max-w-2xl">{t('description1')}</p>
							<p className="text-muted-foreground mb-7 max-w-2xl">{t('description2')}</p>
							<div className="flex items-center gap-3 flex-wrap">
								<Button asChild>
									<Link href="/swap-nano">{t('swapToNano')}</Link>
								</Button>
								<Button variant="outline" asChild>
									<a href="https://nano.org" target="_blank" rel="noopener noreferrer">
										{t('learnAboutNano')} <ExternalLink className="w-4 h-4 ml-2" />
									</a>
								</Button>
							</div>
						</div>
					</div>

					<div className="relative">
						<div className="relative z-10 p-4 h-full flex items-center justify-center min-h-55">
							<svg
								viewBox="0 0 280 200"
								fill="none"
								className="w-full max-w-85 overflow-visible"
								aria-hidden="true"
							>
								<defs>
									<linearGradient id="wlt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#0891b2" />
										<stop offset="100%" stopColor="#2563eb" />
									</linearGradient>
									<filter id="wlt-shadow" x="-15%" y="-25%" width="130%" height="165%">
										<feDropShadow
											dx="0"
											dy="8"
											stdDeviation="12"
											floodColor="#0891b2"
											floodOpacity="0.4"
										/>
									</filter>
									<filter id="wlt-glow" x="-60%" y="-60%" width="220%" height="220%">
										<feGaussianBlur stdDeviation="3" in="SourceGraphic" result="blur" />
										<feMerge>
											<feMergeNode in="blur" />
											<feMergeNode in="SourceGraphic" />
										</feMerge>
									</filter>
									<clipPath id="wlt-clip">
										<rect x="24" y="42" width="232" height="130" rx="14" />
									</clipPath>{' '}
									<linearGradient id="wlt-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
										<stop offset="0%" stopColor="white" stopOpacity="0" />
										<stop offset="40%" stopColor="white" stopOpacity="0.12" />
										<stop offset="55%" stopColor="white" stopOpacity="0.22" />
										<stop offset="70%" stopColor="white" stopOpacity="0.12" />
										<stop offset="100%" stopColor="white" stopOpacity="0" />
									</linearGradient>
									<linearGradient id="wlt-reveal" x1="0%" y1="0%" x2="100%" y2="0%">
										<stop offset="0%" stopColor="white" stopOpacity="0" />
										<stop offset="35%" stopColor="white" stopOpacity="0.6" />
										<stop offset="50%" stopColor="white" stopOpacity="0.95" />
										<stop offset="65%" stopColor="white" stopOpacity="0.6" />
										<stop offset="100%" stopColor="white" stopOpacity="0" />
									</linearGradient>
									<mask id="wlt-x-mask">
										<rect x="-120" y="0" width="120" height="200" fill="url(#wlt-reveal)">
											<animate
												attributeName="x"
												values="-120;320;-120"
												dur="6s"
												keyTimes="0;0.45;1"
												calcMode="spline"
												keySplines="0.4 0 0.6 1; 0 0 1 1"
												repeatCount="indefinite"
											/>
										</rect>
									</mask>
								</defs>
								{/* Card body */}
								<rect
									x="24"
									y="42"
									width="232"
									height="130"
									rx="14"
									fill="url(#wlt-grad)"
									filter="url(#wlt-shadow)"
								/>
								<rect
									x="24"
									y="42"
									width="232"
									height="130"
									rx="14"
									stroke="white"
									strokeOpacity="0.2"
									strokeWidth="1"
								/>
								{/* Decorative rings */}
								<circle
									cx="232"
									cy="60"
									r="52"
									stroke="white"
									strokeOpacity="0.06"
									strokeWidth="1.5"
									clipPath="url(#wlt-clip)"
								/>
								<circle
									cx="232"
									cy="60"
									r="37"
									stroke="white"
									strokeOpacity="0.09"
									strokeWidth="1.5"
									clipPath="url(#wlt-clip)"
								/>
								{/* X watermark — faint base */}
								<g clipPath="url(#wlt-clip)">
									<g transform="translate(107, 60) scale(0.13)" fill="white" fillOpacity="0">
										<path d="M505.763 674.778H453.296L254.183 364.339L52.033 674.778H0L226.563 323.078L20.1835 0H73.6716L255.034 284.171L440.234 0H490.421L281.821 322.157L505.763 674.778Z" />
										<path d="M49.761 302.515H457.703V340.894H49.761V302.515ZM49.761 417.65H457.72V456.029H49.744L49.761 417.65Z" />
									</g>
								</g>
								{/* Shimmer sweep */}
								<rect
									x="-120"
									y="42"
									width="120"
									height="130"
									fill="url(#wlt-shimmer)"
									clipPath="url(#wlt-clip)"
								>
									<animate
										attributeName="x"
										values="-120;320;-120"
										dur="6s"
										keyTimes="0;0.45;1"
										calcMode="spline"
										keySplines="0.4 0 0.6 1; 0 0 1 1"
										repeatCount="indefinite"
									/>
								</rect>
								{/* X watermark — shimmer reveal */}
								<g clipPath="url(#wlt-clip)" mask="url(#wlt-x-mask)">
									<g transform="translate(107, 60) scale(0.13)" fill="white" fillOpacity="0.1">
										<path d="M505.763 674.778H453.296L254.183 364.339L52.033 674.778H0L226.563 323.078L20.1835 0H73.6716L255.034 284.171L440.234 0H490.421L281.821 322.157L505.763 674.778Z" />
										<path d="M49.761 302.515H457.703V340.894H49.761V302.515ZM49.761 417.65H457.72V456.029H49.744L49.761 417.65Z" />
									</g>
								</g>
								{/* Chip */}
								<rect x="44" y="65" width="32" height="24" rx="4" fill="#fbbf24" fillOpacity="0.9" />
								<rect x="44" y="65" width="32" height="24" rx="4" stroke="#d97706" strokeWidth="0.75" />
								<line
									x1="44"
									y1="73.5"
									x2="76"
									y2="73.5"
									stroke="#7c2d12"
									strokeOpacity="0.45"
									strokeWidth="0.75"
								/>
								<line
									x1="44"
									y1="81"
									x2="76"
									y2="81"
									stroke="#7c2d12"
									strokeOpacity="0.45"
									strokeWidth="0.75"
								/>
								<line
									x1="59"
									y1="65"
									x2="59"
									y2="89"
									stroke="#7c2d12"
									strokeOpacity="0.45"
									strokeWidth="0.75"
								/>
								<line
									x1="66"
									y1="65"
									x2="66"
									y2="89"
									stroke="#7c2d12"
									strokeOpacity="0.45"
									strokeWidth="0.75"
								/>
								{/* NFC icon */}
								<g transform="translate(239, 72)" stroke="white" fill="none" strokeLinecap="round">
									<circle cx="-5" cy="0" r="2" fill="white" fillOpacity="0.65" stroke="none" />
									<path d="M0,-5.5 A5.5,5.5 0 0,1 0,5.5" strokeWidth="1.6" strokeOpacity="0.75" />
									<path d="M0,-10 A10,10 0 0,1 0,10" strokeWidth="1.6" strokeOpacity="0.5" />
									<path d="M0,-14.5 A14.5,14.5 0 0,1 0,14.5" strokeWidth="1.6" strokeOpacity="0.3" />
								</g>
								{/* Balance */}
								<text
									x="44"
									y="128"
									fill="white"
									fillOpacity="0.6"
									fontSize="8.5"
									fontFamily="monospace"
									letterSpacing="2.5"
								>
									BALANCE
								</text>
								<text
									x="44"
									y="149"
									fill="white"
									fontSize="20"
									fontWeight="700"
									fontFamily="monospace"
									letterSpacing="0.5"
								>
									420.00 XNO
									<animate
										attributeName="fill-opacity"
										values="1;0.8;1"
										dur="4s"
										repeatCount="indefinite"
									/>
								</text>
								{/* Coin 1 — top-left arc */}
								<g opacity="0" filter="url(#wlt-glow)">
									<animateMotion
										path="M38,-16 C58,8 76,28 96,50"
										dur="2.4s"
										begin="0s"
										repeatCount="indefinite"
										calcMode="spline"
										keyTimes="0;1"
										keySplines="0 0 0.5 1"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.75;1"
										dur="2.4s"
										begin="0s"
										repeatCount="indefinite"
									/>
									<circle
										r="14"
										fill="#06b6d4"
										fillOpacity="0.18"
										stroke="#67e8f9"
										strokeWidth="1.5"
									/>
									<text
										textAnchor="middle"
										dy="3.5"
										fontSize="9"
										fontWeight="700"
										fill="#67e8f9"
										fontFamily="monospace"
									>
										XNO
									</text>
								</g>
								{/* Coin 2 — top-center drop */}
								<g opacity="0" filter="url(#wlt-glow)">
									<animateMotion
										path="M140,-16 C140,4 140,22 140,48"
										dur="2.4s"
										begin="0.8s"
										repeatCount="indefinite"
										calcMode="spline"
										keyTimes="0;1"
										keySplines="0 0 0.5 1"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.75;1"
										dur="2.4s"
										begin="0.8s"
										repeatCount="indefinite"
									/>
									<circle
										r="14"
										fill="#3b82f6"
										fillOpacity="0.18"
										stroke="#93c5fd"
										strokeWidth="1.5"
									/>
									<text
										textAnchor="middle"
										dy="3.5"
										fontSize="9"
										fontWeight="700"
										fill="#93c5fd"
										fontFamily="monospace"
									>
										XNO
									</text>
								</g>
								{/* Coin 3 — top-right arc */}
								<g opacity="0" filter="url(#wlt-glow)">
									<animateMotion
										path="M242,-16 C222,8 204,28 184,50"
										dur="2.4s"
										begin="1.6s"
										repeatCount="indefinite"
										calcMode="spline"
										keyTimes="0;1"
										keySplines="0 0 0.5 1"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.75;1"
										dur="2.4s"
										begin="1.6s"
										repeatCount="indefinite"
									/>
									<circle
										r="14"
										fill="#8b5cf6"
										fillOpacity="0.18"
										stroke="#c4b5fd"
										strokeWidth="1.5"
									/>
									<text
										textAnchor="middle"
										dy="3.5"
										fontSize="9"
										fontWeight="700"
										fill="#c4b5fd"
										fontFamily="monospace"
									>
										XNO
									</text>
								</g>
							</svg>
						</div>
					</div>
				</Appear>
			</section>

			{/* Wallets */}
			<section className="relative z-10 max-w-6xl mx-auto mb-16">
				<Appear className="mb-7">
					<h2 className="text-2xl md:text-3xl font-bold mb-2">{t('step1Title')}</h2>
					<p className="text-muted-foreground max-w-3xl">{t('step1Description')}</p>
				</Appear>
				<div className="grid md:grid-cols-3 gap-4">
					{walletSections.map((section, index) => {
						const Icon = section.icon
						return (
							<Appear key={section.key} delay={100 + index * 100} className="h-full">
								<Card className="h-full relative overflow-hidden border-border/80 bg-card/70 backdrop-blur-xl shadow-xl">
									<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
									<CardContent className="relative z-10 p-5 h-full flex flex-col">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
												<Icon className="w-5 h-5 text-primary" />
											</div>
											<h3 className="font-semibold">{section.title}</h3>
										</div>
										<p className="text-sm text-muted-foreground mb-4">{section.description}</p>
										<div className="mt-auto flex flex-wrap gap-2">
											{section.links.map((link) => (
												<a
													key={link.label}
													href={link.href}
													target="_blank"
													rel="noopener noreferrer"
													className="text-xs rounded-full border border-primary/30 px-2.5 py-1 text-primary hover:bg-primary/10"
												>
													{link.label}
												</a>
											))}
										</div>
									</CardContent>
								</Card>
							</Appear>
						)
					})}
				</div>
			</section>

			{/* How to get Nano */}
			<section className="relative z-10 max-w-6xl mx-auto mb-16">
				<Appear className="mb-7">
					<h2 className="text-2xl md:text-3xl font-bold mb-2">{t('step2Title')}</h2>
					<p className="text-muted-foreground max-w-3xl">{t('step2Description')}</p>
				</Appear>

				<div className="grid md:grid-cols-3 gap-4">
					{acquisitionSections.map((section, index) => {
						const Icon = section.icon
						return (
							<Appear key={section.key} delay={100 + index * 100} className="h-full">
								<Card className="h-full relative overflow-hidden border-border/80 bg-card/70 backdrop-blur-xl shadow-xl">
									<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-transparent" />
									<CardContent className="relative z-10 p-5 h-full flex flex-col">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
												<Icon className="w-5 h-5 text-primary" />
											</div>
											<h3 className="font-semibold">{section.title}</h3>
										</div>
										<p className="text-sm text-muted-foreground">{section.description}</p>
									</CardContent>
								</Card>
							</Appear>
						)
					})}
				</div>

				<Appear delay={350} className="mt-6">
					<a
						href="https://nano.org/get-nano"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
					>
						{t('learnMoreGettingNano')} <ExternalLink className="w-3 h-3" />
					</a>
				</Appear>
			</section>

			{/* New to Nano Card */}
			<Appear delay={300}>
				<Card className="relative max-w-3xl mx-auto border-primary/20 bg-card/70 backdrop-blur-xl overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/5 to-transparent" />
					<CardContent className="p-6">
						<div className="relative z-10 flex items-start gap-3">
							<Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
							<div>
								<h3 className="font-semibold text-primary mb-1">{t('newToNano')}</h3>
								<p className="text-sm text-muted-foreground mb-3">{t('newToNanoDescription')}</p>
								<Button variant="outline" size="sm" asChild>
									<a href="https://nano.org" target="_blank" rel="noopener noreferrer">
										{t('learnAboutNano')} <ExternalLink className="w-3 h-3 ml-1" />
									</a>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</Appear>
		</main>
	)
}
