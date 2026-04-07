import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import type { ComponentType } from 'react'
import {
	ArrowLeftRight,
	BookOpen,
	Bot,
	ChevronDown,
	Code2,
	Coins,
	Compass,
	Cpu,
	CreditCard,
	ExternalLink,
	FileCode,
	Globe,
	Layers,
	Leaf,
	Network,
	Package,
	ShieldCheck,
	Smartphone,
	TrendingDown,
	Users,
	Workflow,
	Zap,
} from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Appear } from '@/components/ui/appear'
import { Button } from '@/components/ui/button'
import { ModernPageBackground } from '@/components/modern-page-background'
import { AnimatedTerminal } from '@/components/why-nano/animated-terminal'
import { AnimatedWorkflow } from '@/components/why-nano/animated-workflow'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.whyNano' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
		},
	}
}

export default async function WhyNanoPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	setRequestLocale(locale)
	const t = await getTranslations({ locale, namespace: 'whyNano' })

	return (
		<main className="relative container mx-auto px-4 pt-28 pb-24">
			<ModernPageBackground />

			{/* Hero Section */}
			<Appear className="relative z-10 mb-32 max-w-6xl mx-auto">
				<div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
					<div>
						<h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
							{t('hero.titlePart1')}{' '}
							<span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
								{t('hero.titleHighlight')}
							</span>
						</h1>
						<p className="text-muted-foreground text-lg mb-2 max-w-2xl">{t('hero.description1')}</p>
						<p className="text-muted-foreground mb-6 max-w-2xl">{t('hero.description2')}</p>
						<div className="flex items-center gap-4">
							<Button variant="outline" asChild className="cursor-pointer">
								<a href="https://nano.org" target="_blank" rel="noopener noreferrer">
									{t('hero.learnAboutNano')} <ExternalLink className="w-4 h-4 ml-2" />
								</a>
							</Button>
						</div>
					</div>

					<div className="relative min-h-80 flex items-center justify-center">
						{/* Agent Payment Network — 5 AI agent nodes on a pentagon, XNO hub at center */}
						<svg
							viewBox="0 0 460 300"
							fill="none"
							className="w-full max-w-135 filter-[brightness(0.78)_saturate(1.1)_contrast(1.15)] dark:filter-none"
							aria-hidden="true"
						>
							<defs>
								<filter id="wn-glow" x="-50%" y="-50%" width="200%" height="200%">
									<feGaussianBlur stdDeviation="2.5" in="SourceGraphic" result="blur" />
									<feMerge>
										<feMergeNode in="blur" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
							</defs>

							{/* Ambient glows */}
							<ellipse cx="230" cy="150" rx="170" ry="105" fill="#0ea5e9" fillOpacity="0.06" />
							<ellipse cx="230" cy="150" rx="105" ry="72" fill="#8b5cf6" fillOpacity="0.05" />

							{/* Mesh connection lines */}
							{/* Nodes: N1(230,58) N2(318,122) N3(284,225) N4(176,225) N5(143,122) C(230,150) */}
							<g stroke="#60a5fa" strokeOpacity="0.18" strokeWidth="1">
								{/* Outer pentagon ring */}
								<line x1="230" y1="58" x2="318" y2="122" />
								<line x1="318" y1="122" x2="284" y2="225" />
								<line x1="284" y1="225" x2="176" y2="225" />
								<line x1="176" y1="225" x2="143" y2="122" />
								<line x1="143" y1="122" x2="230" y2="58" />
								{/* Inner cross diagonals */}
								<line x1="230" y1="58" x2="284" y2="225" strokeOpacity="0.09" />
								<line x1="318" y1="122" x2="176" y2="225" strokeOpacity="0.09" />
								<line x1="230" y1="58" x2="176" y2="225" strokeOpacity="0.09" />
								<line x1="143" y1="122" x2="284" y2="225" strokeOpacity="0.09" />
								<line x1="318" y1="122" x2="143" y2="122" strokeOpacity="0.09" />
							</g>

							{/* ── Center XNO hub ── */}
							<g transform="translate(230, 150)">
								<circle r="36" fill="none" stroke="#60a5fa" strokeOpacity="0.18" strokeWidth="1.2">
									<animate attributeName="r" values="30;44;30" dur="2.6s" repeatCount="indefinite" />
									<animate
										attributeName="stroke-opacity"
										values="0.18;0.05;0.18"
										dur="2.6s"
										repeatCount="indefinite"
									/>
								</circle>
								<circle
									r="26"
									fill="hsl(var(--card))"
									fillOpacity="0.95"
									stroke="#60a5fa"
									strokeOpacity="0.45"
									strokeWidth="1.5"
								/>
								<text textAnchor="middle" y="4" fill="#93c5fd" fontSize="11" fontWeight="800">
									XNO
								</text>
							</g>

							{/* ── Agent nodes ── */}

							{/* N1 — LLM (top) */}
							<g transform="translate(230, 58)">
								<circle r="20" fill="#22d3ee" fillOpacity="0.14" />
								<circle
									r="17"
									fill="hsl(var(--card))"
									stroke="#22d3ee"
									strokeOpacity="0.72"
									strokeWidth="1.3"
								/>
								<line
									x1="-7"
									y1="-4"
									x2="7"
									y2="-4"
									stroke="#22d3ee"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-5"
									y1="0"
									x2="5"
									y2="0"
									stroke="#22d3ee"
									strokeOpacity="0.5"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-7"
									y1="4"
									x2="7"
									y2="4"
									stroke="#22d3ee"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<circle cx="10" cy="-11" r="2.3" fill="#22d3ee" fillOpacity="0.9">
									<animate
										attributeName="fill-opacity"
										values="0.9;0.3;0.9"
										dur="1.6s"
										repeatCount="indefinite"
									/>
								</circle>
								<text
									y="-25"
									textAnchor="middle"
									fill="#22d3ee"
									fillOpacity="0.9"
									fontSize="7.5"
									fontWeight="700"
								>
									AI
								</text>
							</g>

							{/* N2 — API (top-right) */}
							<g transform="translate(318, 122)">
								<circle r="20" fill="#60a5fa" fillOpacity="0.14" />
								<circle
									r="17"
									fill="hsl(var(--card))"
									stroke="#60a5fa"
									strokeOpacity="0.72"
									strokeWidth="1.3"
								/>
								<line
									x1="-7"
									y1="-4"
									x2="7"
									y2="-4"
									stroke="#60a5fa"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-5"
									y1="0"
									x2="5"
									y2="0"
									stroke="#60a5fa"
									strokeOpacity="0.5"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-7"
									y1="4"
									x2="7"
									y2="4"
									stroke="#60a5fa"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<circle cx="10" cy="-11" r="2.3" fill="#60a5fa" fillOpacity="0.9">
									<animate
										attributeName="fill-opacity"
										values="0.9;0.3;0.9"
										dur="1.8s"
										begin="0.3s"
										repeatCount="indefinite"
									/>
								</circle>
								<text
									x="24"
									y="3"
									textAnchor="start"
									fill="#60a5fa"
									fillOpacity="0.9"
									fontSize="7.5"
									fontWeight="700"
								>
									API
								</text>
							</g>

							{/* N3 — Bot (bottom-right) */}
							<g transform="translate(284, 225)">
								<circle r="20" fill="#a78bfa" fillOpacity="0.14" />
								<circle
									r="17"
									fill="hsl(var(--card))"
									stroke="#a78bfa"
									strokeOpacity="0.72"
									strokeWidth="1.3"
								/>
								<line
									x1="-7"
									y1="-4"
									x2="7"
									y2="-4"
									stroke="#a78bfa"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-5"
									y1="0"
									x2="5"
									y2="0"
									stroke="#a78bfa"
									strokeOpacity="0.5"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-7"
									y1="4"
									x2="7"
									y2="4"
									stroke="#a78bfa"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<circle cx="10" cy="-11" r="2.3" fill="#a78bfa" fillOpacity="0.9">
									<animate
										attributeName="fill-opacity"
										values="0.9;0.3;0.9"
										dur="1.5s"
										begin="0.7s"
										repeatCount="indefinite"
									/>
								</circle>
								<text
									y="30"
									textAnchor="middle"
									fill="#a78bfa"
									fillOpacity="0.9"
									fontSize="7.5"
									fontWeight="700"
								>
									Bot
								</text>
							</g>

							{/* N4 — App (bottom-left) */}
							<g transform="translate(176, 225)">
								<circle r="20" fill="#2dd4bf" fillOpacity="0.14" />
								<circle
									r="17"
									fill="hsl(var(--card))"
									stroke="#2dd4bf"
									strokeOpacity="0.72"
									strokeWidth="1.3"
								/>
								<line
									x1="-7"
									y1="-4"
									x2="7"
									y2="-4"
									stroke="#2dd4bf"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-5"
									y1="0"
									x2="5"
									y2="0"
									stroke="#2dd4bf"
									strokeOpacity="0.5"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-7"
									y1="4"
									x2="7"
									y2="4"
									stroke="#2dd4bf"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<circle cx="10" cy="-11" r="2.3" fill="#2dd4bf" fillOpacity="0.9">
									<animate
										attributeName="fill-opacity"
										values="0.9;0.3;0.9"
										dur="2.0s"
										begin="1.1s"
										repeatCount="indefinite"
									/>
								</circle>
								<text
									y="30"
									textAnchor="middle"
									fill="#2dd4bf"
									fillOpacity="0.9"
									fontSize="7.5"
									fontWeight="700"
								>
									App
								</text>
							</g>

							{/* N5 — IoT (top-left) */}
							<g transform="translate(143, 122)">
								<circle r="20" fill="#fb923c" fillOpacity="0.14" />
								<circle
									r="17"
									fill="hsl(var(--card))"
									stroke="#fb923c"
									strokeOpacity="0.72"
									strokeWidth="1.3"
								/>
								<line
									x1="-7"
									y1="-4"
									x2="7"
									y2="-4"
									stroke="#fb923c"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-5"
									y1="0"
									x2="5"
									y2="0"
									stroke="#fb923c"
									strokeOpacity="0.5"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<line
									x1="-7"
									y1="4"
									x2="7"
									y2="4"
									stroke="#fb923c"
									strokeOpacity="0.7"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
								<circle cx="10" cy="-11" r="2.3" fill="#fb923c" fillOpacity="0.9">
									<animate
										attributeName="fill-opacity"
										values="0.9;0.3;0.9"
										dur="1.7s"
										begin="1.4s"
										repeatCount="indefinite"
									/>
								</circle>
								<text
									x="-24"
									y="3"
									textAnchor="end"
									fill="#fb923c"
									fillOpacity="0.9"
									fontSize="7.5"
									fontWeight="700"
								>
									IoT
								</text>
							</g>

							{/* ── Info badges ── */}
							<g transform="translate(362, 66)" className="dark:opacity-0">
								<rect
									x="-26"
									y="-10"
									width="52"
									height="20"
									rx="10"
									fill="none"
									stroke="#16a34a"
									strokeOpacity="0.95"
									strokeWidth="1.2"
								/>
								<text textAnchor="middle" y="3" fill="#15803d" fontSize="7.5" fontWeight="800">
									{'< 1s'}
								</text>
							</g>
							<g transform="translate(362, 66)" className="opacity-0 dark:opacity-100">
								<rect
									x="-26"
									y="-10"
									width="52"
									height="20"
									rx="10"
									fill="#052e16"
									fillOpacity="0.45"
									stroke="#22c55e"
									strokeOpacity="0.45"
									strokeWidth="1"
								/>
								<text textAnchor="middle" y="3" fill="#4ade80" fontSize="7.5" fontWeight="700">
									{'< 1s'}
								</text>
							</g>
							<g transform="translate(100, 253)" className="dark:opacity-0">
								<rect
									x="-22"
									y="-10"
									width="44"
									height="20"
									rx="10"
									fill="none"
									stroke="#7c3aed"
									strokeOpacity="0.95"
									strokeWidth="1.2"
								/>
								<text textAnchor="middle" y="3" fill="#6d28d9" fontSize="7.5" fontWeight="800">
									0 fee
								</text>
							</g>
							<g transform="translate(100, 253)" className="opacity-0 dark:opacity-100">
								<rect
									x="-22"
									y="-10"
									width="44"
									height="20"
									rx="10"
									fill="#1e1a3a"
									fillOpacity="0.45"
									stroke="#8b5cf6"
									strokeOpacity="0.45"
									strokeWidth="1"
								/>
								<text textAnchor="middle" y="3" fill="#c4b5fd" fontSize="7.5" fontWeight="700">
									0 fee
								</text>
							</g>

							{/* ── Animated payment packets (coherent destination mapping) ── */}
							<g filter="url(#wn-glow)">
								{/* App → API (client pays service) */}
								<g opacity="0">
									<animateMotion
										path="M176 225 L318 122"
										dur="1.8s"
										begin="0s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="1.8s"
										begin="0s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#0f4a3a"
										fillOpacity="0.12"
										stroke="#2dd4bf"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#5eead4" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* IoT → API (machine triggers payment) */}
								<g opacity="0">
									<animateMotion
										path="M143 122 L318 122"
										dur="1.7s"
										begin="0.55s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="1.7s"
										begin="0.55s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#431407"
										fillOpacity="0.12"
										stroke="#fb923c"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#fdba74" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* Bot → API (automation pays endpoint) */}
								<g opacity="0">
									<animateMotion
										path="M284 225 L318 122"
										dur="1.9s"
										begin="1.1s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="1.9s"
										begin="1.1s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#2e1065"
										fillOpacity="0.12"
										stroke="#a78bfa"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#c4b5fd" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* API → LLM (provider-to-provider call) */}
								<g opacity="0">
									<animateMotion
										path="M318 122 L230 58"
										dur="1.85s"
										begin="1.75s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="1.85s"
										begin="1.75s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#1e3a5f"
										fillOpacity="0.12"
										stroke="#60a5fa"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#93c5fd" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* LLM → IoT (direct service call) */}
								<g opacity="0">
									<animateMotion
										path="M230 58 L143 122"
										dur="1.95s"
										begin="0.85s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="1.95s"
										begin="0.85s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#0e7490"
										fillOpacity="0.12"
										stroke="#22d3ee"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#22d3ee" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* LLM → App (direct service call) */}
								<g opacity="0">
									<animateMotion
										path="M230 58 L176 225"
										dur="2.2s"
										begin="1.4s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="2.2s"
										begin="1.4s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#0f4a3a"
										fillOpacity="0.09"
										stroke="#2dd4bf"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#5eead4" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
								{/* IoT → Bot (direct service call) */}
								<g opacity="0">
									<animateMotion
										path="M143 122 L284 225"
										dur="2.1s"
										begin="2.1s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0;1;1;0"
										keyTimes="0;0.12;0.88;1"
										dur="2.1s"
										begin="2.1s"
										repeatCount="indefinite"
									/>
									<circle
										r="9"
										fill="#2e1065"
										fillOpacity="0.09"
										stroke="#a78bfa"
										strokeWidth="1.3"
									/>
									<text textAnchor="middle" dy="3" fill="#c4b5fd" fontSize="5.5" fontWeight="700">
										XNO
									</text>
								</g>
							</g>
						</svg>
					</div>
				</div>
			</Appear>

			{/* Bento Grid Features */}
			<section className="relative z-10 max-w-6xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold text-center">{t('features.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('features.subtitle')}</p>
				</Appear>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(160px,auto)]">
					{/* Key Feature - Large */}
					<Appear
						delay={100}
						className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-500 order-1"
					>
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10 h-full flex flex-col gap-5">
							<div className="flex items-center">
								<div className="w-12 h-12 mr-4 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-500">
									<Zap className="w-6 h-6" />
								</div>
								<h3 className="text-lg sm:text-xl md:text-2xl font-bold">
									{t('features.instantSettlement.title')}
								</h3>
							</div>
							<div className="flex flex-col justify-between h-full space-y-3 sm:space-y-2 md:space-y-0 text-sm sm:text-base">
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">
										{t('features.instantSettlement.instantLabel')}
									</strong>{' '}
									{t('features.instantSettlement.instantText')}
								</p>
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">
										{t('features.instantSettlement.feelessLabel')}
									</strong>{' '}
									{t('features.instantSettlement.feelessText')}
								</p>
								<p className="text-muted-foreground leading-relaxed max-w-2xl">
									<strong className="text-foreground">
										{t('features.instantSettlement.decentralizedLabel')}
									</strong>{' '}
									{t('features.instantSettlement.decentralizedText')}
								</p>
							</div>
						</div>
					</Appear>

					<Appear delay={200} className="order-2 sm:order-3">
						<BentoCard
							icon={Bot}
							title={t('features.agentNative.title')}
							description={t('features.agentNative.description')}
							accentColor="orange"
						/>
					</Appear>

					<Appear delay={300} className="order-2 sm:order-3">
						<BentoCard
							icon={Network}
							title={t('features.x402Protocol.title')}
							description={t('features.x402Protocol.description')}
							accentColor="blue"
						/>
					</Appear>

					{/* Feature 4 - Wide */}
					<Appear
						delay={400}
						className="md:col-span-2 relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-500 order-5 sm:order-3"
					>
						<div className="absolute inset-0 bg-linear-to-r from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="flex flex-col gap-5">
							<div className="flex items-center gap-4">
								<div className="w-11 h-11 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400">
									<Leaf className="w-5 h-5" />
								</div>
								<h3 className="text-lg font-bold">{t('features.sustainableCompute.title')}</h3>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									{t('features.sustainableCompute.description')}
								</p>
							</div>
						</div>
					</Appear>

					<Appear delay={500} className="order-2 sm:order-3">
						<BentoCard
							icon={Coins}
							title={t('features.mcpIntegration.title')}
							description={t('features.mcpIntegration.description')}
							accentColor="purple"
						/>
					</Appear>
				</div>
			</section>

			{/* Use Cases — Terminal Look */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-10 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('x402.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('x402.subtitle')}</p>
				</Appear>

				<Appear delay={150}>
					<AnimatedTerminal />
				</Appear>
			</section>

			{/* n8n-style Workflow */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-10 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold text-center">{t('workflow.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('workflow.subtitle')}</p>
				</Appear>

				<Appear delay={150}>
					<AnimatedWorkflow />
				</Appear>
			</section>

			{/* How It Works */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-14 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('howItWorks.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('howItWorks.subtitle')}</p>
				</Appear>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
					{/* Connector line — desktop only */}
					<div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-linear-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40" />

					{/* Step 1 */}
					<Appear delay={100} className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-5">
							<Layers className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
							{t('howItWorks.step1.badge')}
						</span>
						<h3 className="text-lg font-bold mb-2">{t('howItWorks.step1.title')}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							{t('howItWorks.step1.description')}
						</p>
					</Appear>

					{/* Step 2 */}
					<Appear delay={200} className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
							<ArrowLeftRight className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
							{t('howItWorks.step2.badge')}
						</span>
						<h3 className="text-lg font-bold mb-2">{t('howItWorks.step2.title')}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							{t('howItWorks.step2.description')}
						</p>
					</Appear>

					{/* Step 3 */}
					<Appear delay={300} className="flex flex-col items-center text-center">
						<div className="z-10 w-24 h-24 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
							<ShieldCheck className="w-10 h-10" />
						</div>
						<span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
							{t('howItWorks.step3.badge')}
						</span>
						<h3 className="text-lg font-bold mb-2">{t('howItWorks.step3.title')}</h3>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							{t('howItWorks.step3.description')}
						</p>
					</Appear>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<Appear className="text-center mb-10">
					<h2 className="text-2xl md:text-3xl font-bold">{t('comparison.title')}</h2>
				</Appear>

				<Appear delay={100}>
					<div className="grid grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
						{/* Header */}
						<div className="bg-muted p-3 md:p-5 flex items-center">
							<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
								{t('comparison.metric')}
							</span>
						</div>
						<div className="bg-muted p-3 md:p-5 flex items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
							<span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs md:text-base">
								{t('comparison.nano')}
							</span>
						</div>
						<div className="bg-muted p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-semibold text-xs md:text-base">
								{t('comparison.bitcoin')}
							</span>
						</div>
						<div className="bg-muted p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-semibold text-xs md:text-base">
								{t('comparison.tether')}
							</span>
						</div>

						{/* Latency */}
						<div className="bg-card p-3 md:p-5 flex items-center">
							<span className="font-medium text-sm">{t('comparison.latency')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="font-mono text-sm">{t('comparison.latencyNano')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.latencyBitcoin')}
							</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.latencyTether')}
							</span>
						</div>

						{/* Cost */}
						<div className="bg-card p-3 md:p-5 flex items-center">
							<span className="font-medium text-sm">{t('comparison.txFees')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="font-mono text-sm">{t('comparison.feesNano')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.feesBitcoin')}
							</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.feesTether')}
							</span>
						</div>

						{/* Architecture */}
						<div className="bg-card p-3 md:p-5 flex items-center">
							<span className="font-medium text-sm">{t('comparison.architecture')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="font-mono text-center text-xs md:text-sm">{t('comparison.archNano')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
								{t('comparison.archBitcoin')}
							</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
								{t('comparison.archTether')}
							</span>
						</div>

						{/* Energy */}
						<div className="bg-card p-3 md:p-5 flex items-center">
							<span className="font-medium text-sm">{t('comparison.energy')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="font-mono text-sm">{t('comparison.energyNano')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.energyBitcoin')}
							</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.energyTether')}
							</span>
						</div>

						{/* Availability */}
						<div className="bg-card p-3 md:p-5 flex items-center">
							<span className="font-medium text-sm">{t('comparison.availability')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="font-mono text-sm">{t('comparison.availabilityNano')}</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-sm">
								{t('comparison.availabilityBitcoin')}
							</span>
						</div>
						<div className="bg-card p-3 md:p-5 flex items-center justify-center">
							<span className="text-muted-foreground font-mono text-center text-xs md:text-sm">
								{t('comparison.availabilityTether')}
							</span>
						</div>
					</div>
				</Appear>
			</section>

			{/* Supply & Distribution */}
			<section className="relative z-10 max-w-4xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('supply.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('supply.subtitle')}</p>
				</Appear>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<Appear
						delay={100}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300 text-center"
					>
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
								<Coins className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">{t('supply.fixedSupply.value')}</div>
							<div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
								{t('supply.fixedSupply.title')}
							</div>
							<p className="text-muted-foreground text-sm">{t('supply.fixedSupply.description')}</p>
						</div>
					</Appear>

					<Appear
						delay={200}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300 text-center"
					>
						<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
								<Users className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">{t('supply.fullyDistributed.value')}</div>
							<div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
								{t('supply.fullyDistributed.title')}
							</div>
							<p className="text-muted-foreground text-sm">{t('supply.fullyDistributed.description')}</p>
						</div>
					</Appear>

					<Appear
						delay={300}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-7 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-300 text-center"
					>
						<div className="absolute inset-0 bg-linear-to-br from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
								<TrendingDown className="w-6 h-6" />
							</div>
							<div className="text-3xl font-bold mb-1">{t('supply.zeroInflation.value')}</div>
							<div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
								{t('supply.zeroInflation.title')}
							</div>
							<p className="text-muted-foreground text-sm">{t('supply.zeroInflation.description')}</p>
						</div>
					</Appear>
				</div>
			</section>

			{/* Beyond AI */}
			<section className="relative z-10 max-w-6xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('beyondAI.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('beyondAI.subtitle')}</p>
				</Appear>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					<Appear
						delay={100}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
									<CreditCard className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">{t('beyondAI.p2pPayments.title')}</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{t('beyondAI.p2pPayments.description')}
							</p>
						</div>
					</Appear>

					<Appear
						delay={200}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
									<Globe className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">{t('beyondAI.globalAccess.title')}</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{t('beyondAI.globalAccess.description')}
							</p>
						</div>
					</Appear>

					<Appear
						delay={300}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-purple-500/40 dark:hover:border-purple-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
									<Smartphone className="w-5 h-5" />
								</div>
								<h3 className="ml-3 text-base font-bold">{t('beyondAI.pointOfSale.title')}</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{t('beyondAI.pointOfSale.description')}
							</p>
						</div>
					</Appear>

					<Appear
						delay={400}
						className="relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300"
					>
						<div className="absolute inset-0 bg-linear-to-br from-orange-500/5 dark:from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative z-10">
							<div className="flex items-center mb-3">
								<div className="flex-none w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
									<Cpu className="w-5 h-5" />
								</div>
								<h3 className="text-base font-bold ml-3 whitespace-nowrap">
									{t('beyondAI.iotMicropayments.title')}
								</h3>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{t('beyondAI.iotMicropayments.description')}
							</p>
						</div>
					</Appear>
				</div>
			</section>

			{/* Developer Resources */}
			<section className="relative z-10 max-w-5xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('developerResources.title')}</h2>
					<p className="text-muted-foreground max-w-xl text-center">{t('developerResources.subtitle')}</p>
				</Appear>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
					<Appear delay={100} className="backdrop-blur-xl">
						<a
							href="https://docs.nano.org"
							target="_blank"
							rel="noopener noreferrer"
							className="block relative group overflow-hidden rounded-2xl border border-border bg-card/60  p-6 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300"
						>
							<div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 dark:from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
											<BookOpen className="w-5 h-5" />
										</div>
										<h3 className="ml-3 text-base font-bold">
											{t('developerResources.nanoDocs.title')}
										</h3>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.nanoDocs.description')}
								</p>
							</div>
						</a>
					</Appear>

					<Appear delay={150} className="backdrop-blur-xl">
						<a
							href="https://github.com/x402nano"
							target="_blank"
							rel="noopener noreferrer"
							className="block relative group overflow-hidden rounded-2xl border border-border bg-card/60 p-6 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300"
						>
							<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
											<Code2 className="w-5 h-5" />
										</div>
										<h3 className="ml-3 text-base font-bold">
											{t('developerResources.x402Nano.title')}
										</h3>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.x402Nano.description')}
								</p>
							</div>
						</a>
					</Appear>

					<Appear delay={200} className="backdrop-blur-xl">
						<a
							href="https://github.com/infinitybay/nano-sdk"
							target="_blank"
							rel="noopener noreferrer"
							className="block relative group overflow-hidden rounded-2xl border border-border bg-card/60 p-6 hover:border-purple-500/40 dark:hover:border-purple-500/30 transition-all duration-300"
						>
							<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
											<FileCode className="w-5 h-5" />
										</div>
										<h3 className="ml-3 text-base font-bold">
											{t('developerResources.nanoSdk.title')}
										</h3>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.nanoSdk.description')}
								</p>
							</div>
						</a>
					</Appear>

					<Appear delay={250} className="backdrop-blur-xl">
						<a
							href="https://github.com/marvinroger/nanocurrency-js/tree/master/packages/nanocurrency"
							target="_blank"
							rel="noopener noreferrer"
							className="block relative group overflow-hidden rounded-2xl border border-border bg-card/60 p-6 hover:border-orange-500/40 dark:hover:border-orange-500/30 transition-all duration-300"
						>
							<div className="absolute inset-0 bg-linear-to-br from-orange-500/5 dark:from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
											<Package className="w-5 h-5" />
										</div>
										<h3 className="ml-3 text-base font-bold">
											{t('developerResources.tsNanocurrency.title')}
										</h3>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.tsNanocurrency.description')}
								</p>
							</div>
						</a>
					</Appear>

					<Appear delay={300} className="backdrop-blur-xl">
						<a
							href="https://nano.casa/"
							target="_blank"
							rel="noopener noreferrer"
							className="block relative group overflow-hidden rounded-2xl border border-border bg-card/60 p-6 hover:border-green-500/40 dark:hover:border-green-500/30 transition-all duration-300"
						>
							<div className="absolute inset-0 bg-linear-to-br from-green-500/5 dark:from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
											<Compass className="w-5 h-5" />
										</div>
										<h3 className="ml-3 text-base font-bold">
											{t('developerResources.nanoCasa.title')}
										</h3>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.nanoCasa.description')}
								</p>
							</div>
						</a>
					</Appear>
				</div>

				{/* Coming Soon */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 mb-4">
						<div className="h-px flex-1 bg-border" />
						<span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
							{t('developerResources.comingSoon')}
						</span>
						<div className="h-px flex-1 bg-border" />
					</div>

					<div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/40 backdrop-blur-xl p-6 opacity-80">
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
								<Workflow className="w-5 h-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="text-base font-bold">{t('developerResources.n8nNode.title')}</h3>
									<span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/20 whitespace-nowrap">
										{t('developerResources.n8nNode.badge')}
									</span>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t('developerResources.n8nNode.description')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="relative z-10 max-w-3xl mx-auto mb-32">
				<Appear className="flex flex-col items-center mb-12 space-y-3">
					<h2 className="text-2xl md:text-3xl font-bold">{t('faq.title')}</h2>
				</Appear>

				<Appear delay={100}>
					<div className="space-y-3">
						<details className="group rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
							<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
								{t('faq.q1.question')}
								<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
							</summary>
							<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
								{t('faq.q1.answer')}
							</div>
						</details>

						<details className="group rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
							<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
								{t('faq.q2.question')}
								<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
							</summary>
							<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
								{t('faq.q2.answer')}
							</div>
						</details>

						<details className="group rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
							<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
								{t('faq.q3.question')}
								<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
							</summary>
							<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
								{t('faq.q3.answer')}
							</div>
						</details>

						<details className="group rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
							<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
								{t('faq.q4.question')}
								<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
							</summary>
							<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
								{t('faq.q4.answer')}
							</div>
						</details>

						<details className="group rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
							<summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
								{t('faq.q5.question')}
								<ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
							</summary>
							<div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
								{t.rich('faq.q5.answer', {
									link: (chunks) => (
										<a
											href="https://docs.nano.org"
											target="_blank"
											rel="noopener noreferrer"
											className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-500"
										>
											{chunks}
										</a>
									),
								})}
							</div>
						</details>
					</div>
				</Appear>
			</section>

			{/* CTA */}
			<Appear className="relative z-10 text-center mb-8">
				<h2 className="text-2xl md:text-3xl font-bold mb-4">{t('cta.title')}</h2>
				<p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('cta.description')}</p>
				<div className="flex items-center justify-center gap-4">
					<Button asChild className="cursor-pointer">
						<Link href="/get-nano">{t('cta.getNano')}</Link>
					</Button>
					<Button variant="outline" asChild className="cursor-pointer">
						<Link href="/swap-nano">{t('cta.swapToXno')}</Link>
					</Button>
				</div>
			</Appear>
		</main>
	)
}

function BentoCard({
	icon: Icon,
	title,
	description,
	accentColor,
}: {
	icon: ComponentType<{ className?: string }>
	title: string
	description: string
	accentColor: 'purple' | 'blue' | 'orange'
}) {
	const colors = {
		purple: {
			bg: 'bg-purple-100 dark:bg-purple-950/50',
			border: 'border-purple-200 dark:border-purple-500/20',
			text: 'text-purple-600 dark:text-purple-400',
			hover: 'hover:border-purple-500/40 dark:hover:border-purple-500/30',
			glow: 'from-purple-500/5 dark:from-purple-500/10',
		},
		blue: {
			bg: 'bg-blue-100 dark:bg-blue-950/50',
			border: 'border-blue-200 dark:border-blue-500/20',
			text: 'text-blue-600 dark:text-blue-400',
			hover: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
			glow: 'from-blue-500/5 dark:from-blue-500/10',
		},
		orange: {
			bg: 'bg-orange-100 dark:bg-orange-950/50',
			border: 'border-orange-200 dark:border-orange-500/20',
			text: 'text-orange-600 dark:text-orange-400',
			hover: 'hover:border-orange-500/40 dark:hover:border-orange-500/30',
			glow: 'from-orange-500/5 dark:from-orange-500/10',
		},
	}

	const c = colors[accentColor]

	return (
		<div
			className={`relative group overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 ${c.hover} transition-all duration-300`}
		>
			<div
				className={`absolute inset-0 bg-linear-to-br ${c.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
			/>
			<div className="relative z-10">
				<div className="flex items-center mb-2">
					<div
						className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mr-2`}
					>
						<Icon className="w-5 h-5" />
					</div>
					<h3 className="text-lg font-bold">{title}</h3>
				</div>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</div>
	)
}
