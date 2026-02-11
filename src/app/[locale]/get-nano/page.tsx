import type { Metadata } from 'next'
import { ArrowRightLeft, Building2, Droplets, ExternalLink, Info, Monitor, Shield, Smartphone } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { Appear } from '@/components/ui/appear'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations('getNano')

	return (
		<main className="container mx-auto px-4 py-16">
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-500">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#9f9f9f2e_1px,transparent_1px),linear-gradient(to_bottom,#9f9f9f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]  bg-size-[50px_50px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-cyan-500/10 dark:bg-cyan-500/12.5 blur-[120px] rounded-full mix-blend-screen" />
				<div className="absolute bottom-0 right-0 w-200 h-150 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
			</div>
			{/* Hero Section */}
			<Appear className="text-center mb-28">
				<Badge variant="outline" className="mb-6">
					{t('badge')}
				</Badge>
				<h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">{t('description1')}</p>
				<p className="text-muted-foreground max-w-2xl mx-auto mb-6">{t('description2')}</p>
				<div className="flex items-center justify-center gap-4">
					<Button variant="ghost" asChild>
						<Link href="/swap-nano">{t('swapToNano')}</Link>
					</Button>
					<Button variant="outline" asChild>
						<a href="https://nano.org" target="_blank" rel="noopener noreferrer">
							{t('learnAboutNano')} <ExternalLink className="w-4 h-4 ml-2" />
						</a>
					</Button>
				</div>
			</Appear>

			{/* Steps Grid */}
			<div className="grid md:grid-cols-2 gap-36 max-w-5xl mx-auto mb-16">
				{/* Step 1: Choose a wallet */}
				<Appear delay={100}>
					<Badge className="mb-4">{t('step1Badge')}</Badge>
					<h2 className="text-2xl md:text-3xl font-bold mb-3">{t('step1Title')}</h2>
					<p className="text-muted-foreground mb-8">{t('step1Description')}</p>

					<div className="space-y-6">
						{/* Mobile */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Smartphone className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('mobile')}</h3>
								<p className="text-sm text-muted-foreground mb-2">{t('mobileDescription')}</p>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://natrium.io"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										Natrium
									</a>
									<a
										href="https://nautilus.io"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										Nautilus
									</a>
									<a
										href="https://cakewallet.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										Cake Wallet
									</a>
								</div>
							</div>
						</div>

						{/* Desktop/Web */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Monitor className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('desktopWeb')}</h3>
								<p className="text-sm text-muted-foreground mb-2">{t('desktopWebDescription')}</p>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://nault.cc"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										Nault.cc
									</a>
									<a
										href="https://cakewallet.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										Cake Wallet
									</a>
								</div>
							</div>
						</div>

						{/* Hardware */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Shield className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('hardware')}</h3>
								<p className="text-sm text-muted-foreground mb-2">{t('hardwareDescription')}</p>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://nault.cc"
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										{t('ledgerViaNault')}
									</a>
								</div>
							</div>
						</div>
					</div>

					<a
						href="https://nano.org/get-nano"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-6"
					>
						{t('viewWalletDirectory')} <ExternalLink className="w-3 h-3" />
					</a>
				</Appear>

				{/* Step 2: Get Nano */}
				<Appear delay={200}>
					<Badge className="mb-4">{t('step2Badge')}</Badge>
					<h2 className="text-2xl md:text-3xl font-bold mb-3">{t('step2Title')}</h2>
					<p className="text-muted-foreground mb-8">{t('step2Description')}</p>

					<div className="space-y-6">
						{/* Exchanges */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Building2 className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('exchanges')}</h3>
								<p className="text-sm text-muted-foreground">{t('exchangesDescription')}</p>
							</div>
						</div>

						{/* Swap Services */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<ArrowRightLeft className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('swapServices')}</h3>
								<p className="text-sm text-muted-foreground">{t('swapServicesDescription')}</p>
							</div>
						</div>

						{/* Faucets */}
						<div className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Droplets className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">{t('faucets')}</h3>
								<p className="text-sm text-muted-foreground">{t('faucetsDescription')}</p>
							</div>
						</div>
					</div>

					<a
						href="https://nano.org/get-nano"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-6"
					>
						{t('learnMoreGettingNano')} <ExternalLink className="w-3 h-3" />
					</a>
				</Appear>
			</div>

			{/* New to Nano Card */}
			<Appear delay={300}>
				<Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
					<CardContent className="p-6">
						<div className="flex items-start gap-3">
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
