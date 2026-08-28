import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'
import { PaymentLinkBuilder } from '@/components/tools/payment-link-builder'
import { ToolPanel } from '@/components/tools/tool-panel'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.tools.paymentLinks' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/tools/payment-links',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/tools/payment-links', locale),
		},
	}
}

export default async function PaymentLinksPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'tools.paymentLinks' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/tools/payment-links" />
			<ModernPageBackground />

			<header className="mb-10 animate-fade-in-up">
				<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('kicker')}
				</div>
				<h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
			</header>

			<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<ToolPanel index="02" title={t('h1')} sub={t('sub')}>
					<PaymentLinkBuilder />
				</ToolPanel>
			</div>
		</main>
	)
}
