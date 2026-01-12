import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Card } from '@/components/ui/card'
import { LoadingArea } from '@/components/loading-area'
import { SpeculationTable } from '@/components/speculation-table'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
			</div>

			<Suspense
				fallback={
					<Card className="overflow-hidden h-513.75 relative">
						<LoadingArea />
					</Card>
				}
			>
				<SpeculationTable />
			</Suspense>
		</main>
	)
}
