import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { localePath, ogImage, ogLocale } from '@/lib/seo'

import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'
import { ToolPanel } from '@/components/tools/tool-panel'
import { UnitConverter } from '@/components/tools/unit-converter'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.tools.converter' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/tools/unit-converter',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/tools/unit-converter', locale),
		},
	}
}

export default async function UnitConverterPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'tools.converter' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/tools/unit-converter" />
			<ModernPageBackground />

			<header className="mb-10 animate-fade-in-up">
				<div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
					{t('kicker')}
				</div>
				<h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
			</header>

			<div className="max-w-3xl animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<ToolPanel index="01" title={t('h1')} sub={t('sub')}>
					<UnitConverter />
				</ToolPanel>
			</div>
		</main>
	)
}
