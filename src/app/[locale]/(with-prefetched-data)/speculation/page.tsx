import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LoadingArea } from '@/components/loading-area'
import { SpeculationTable } from '@/components/speculation-table'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.speculation' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/speculation',
		},
		alternates: {
			canonical: '/speculation',
		},
	}
}

export default async function SpeculationPage({ params }: Props) {
	const { locale } = await params

	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'speculation' })
	const tDisclaimer = await getTranslations({ locale, namespace: 'legal.inlineDisclaimers' })

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<div className="mb-20 sm:mb-12">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
				<p className="text-xs text-muted-foreground/70 mt-2">{tDisclaimer('speculation')}</p>
			</div>

			<Suspense
				fallback={
					<div className="overflow-hidden h-365.5 relative">
						<LoadingArea />
					</div>
				}
			>
				<SpeculationTable />
			</Suspense>
		</main>
	)
}
