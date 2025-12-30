import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Calculator } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ParityCalculator } from '@/components/parity-calculator'
import { ParityHighlight } from '@/components/parity-highlight'
import { ParitySettingsPopover } from '@/components/parity-table'
import { SpeculationCalculator } from '@/components/speculation-calculator'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.calculators' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/calculators',
		},
		alternates: {
			canonical: '/calculators',
		},
	}
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function CalculatorsPage({ params }: Props) {
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
				<div className="grid gap-10">
					<Card className="gap-2">
						<CardHeader className="flex justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Calculator className="h-5 w-5 text-[#209CE9]" />
									{t('title')}
								</CardTitle>
								<CardDescription>{t('description')}</CardDescription>
							</div>
							<ParitySettingsPopover />
						</CardHeader>
						<CardContent className="pb-4 px-4">
							<ParityHighlight />
						</CardContent>
					</Card>

					<ParityCalculator />

					<SpeculationCalculator />
				</div>
			</HydrationBoundary>
		</main>
	)
}
