import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { Card, CardContent } from '@/components/ui/card'
import { ParityHighlight } from '@/components/parity-highlight'
import { ParitySettingsPopover, ParityTable } from '@/components/parity-table'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.parity' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/parity',
		},
		alternates: {
			canonical: '/parity',
		},
	}
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function ParityPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations('parity')
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return (
		<main className="container mx-auto px-4 py-8">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
					<p className="text-muted-foreground text-lg">{t('description')}</p>
				</div>

				<div className="grid gap-8">
					{/* XNO Parity Highlight */}
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">{t('nanoScarcityParity')}</h2>
							<ParitySettingsPopover />
						</div>
						<ParityHighlight />
					</section>

					{/* Main Parity Table */}
					<section className="w-full overflow-x-auto">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">{t('scarcityParityMatrix')}</h2>
							<ParitySettingsPopover />
						</div>
						<ParityTable />
					</section>

					{/* Key Takeaway */}
					<Card className="border-primary/20">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-3">{t('keyTakeaway')}</h3>
							<p className="text-muted-foreground mb-4">
								{t.rich('keyTakeawayText', {
									highlight: (chunks) => (
										<span className="text-foreground font-medium">{chunks}</span>
									),
								})}
							</p>
							<blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
								{t('blockquote')}
							</blockquote>
						</CardContent>
					</Card>
				</div>
			</HydrationBoundary>
		</main>
	)
}
