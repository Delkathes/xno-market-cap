import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ArrowRightLeft, Fingerprint, Link2, ScanSearch, Wrench, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.tools.hub' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/tools',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/tools', locale),
		},
	}
}

interface ToolCard {
	href: string
	index: string
	icon: LucideIcon
	titleKey: string
	descriptionKey: string
	span: string
	delay: string
}

export default async function ToolsPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'tools.hub' })
	const tnav = await getTranslations({ locale, namespace: 'navigation' })

	const cards: ToolCard[] = [
		{
			href: '/tools/account-inspector',
			index: '01',
			icon: ScanSearch,
			titleKey: 'toolAccountInspector',
			descriptionKey: 'toolAccountInspectorDescription',
			span: 'lg:col-span-3',
			delay: '80ms',
		},
		{
			href: '/tools/fee-comparison',
			index: '02',
			icon: Zap,
			titleKey: 'toolFeeComparison',
			descriptionKey: 'toolFeeComparisonDescription',
			span: 'lg:col-span-3',
			delay: '160ms',
		},
		{
			href: '/tools/unit-converter',
			index: '03',
			icon: ArrowRightLeft,
			titleKey: 'toolUnitConverter',
			descriptionKey: 'toolUnitConverterDescription',
			span: 'lg:col-span-2',
			delay: '240ms',
		},
		{
			href: '/tools/payment-links',
			index: '04',
			icon: Link2,
			titleKey: 'toolPaymentLinks',
			descriptionKey: 'toolPaymentLinksDescription',
			span: 'lg:col-span-2',
			delay: '320ms',
		},
		{
			href: '/tools/address-tools',
			index: '05',
			icon: Fingerprint,
			titleKey: 'toolAddressTools',
			descriptionKey: 'toolAddressToolsDescription',
			span: 'lg:col-span-2',
			delay: '400ms',
		},
	]

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/tools" />
			<ModernPageBackground />

			{/* Hero */}
			<header className="mb-10 animate-fade-in-up">
				<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					<Wrench className="h-3.5 w-3.5" />
					{t('kicker')}
				</div>
				<h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg max-w-2xl">{t('intro')}</p>
			</header>

			<div className="grid gap-4 lg:grid-cols-6">
				{cards.map((card) => (
					<Link
						key={card.href}
						href={card.href}
						className={`group relative flex flex-col justify-between rounded-md border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-in-up ${card.span}`}
						style={{ animationDelay: card.delay }}
					>
						<div>
							<div className="flex items-start justify-between">
								<span className="font-mono text-xs text-muted-foreground/40 tabular-nums select-none">
									{card.index}
								</span>
								<card.icon className="h-5 w-5 text-primary/70 transition-colors group-hover:text-primary" />
							</div>
							<h2 className="mt-6 text-lg font-bold tracking-tight text-balance">
								{tnav(card.titleKey)}
							</h2>
							<p className="mt-1.5 text-sm text-muted-foreground">{tnav(card.descriptionKey)}</p>
						</div>
						<div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
							{t('openTool')}
							<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
						</div>
					</Link>
				))}
			</div>
		</main>
	)
}
