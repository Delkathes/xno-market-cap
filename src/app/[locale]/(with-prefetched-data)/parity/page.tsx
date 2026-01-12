import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ParityHighlight } from '@/components/parity-highlight'
import { ParitySettingsPopover, ParityTable, ParityTableSkeleton } from '@/components/parity-table'

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

export default async function ParityPage({ params }: Props) {
	const { locale } = await params

	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'parity' })

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('title')}</h1>
				<p className="text-muted-foreground text-lg">{t('description')}</p>
			</div>

			<div className="grid gap-8">
				{/* XNO Parity Highlight */}
				<Suspense
					fallback={
						<section>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-semibold">{t('nanoScarcityParity')}</h2>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Loader className="h-4 w-4" />
									<span className="sr-only">{t('fiatCurrencySettings')}</span>
								</Button>
							</div>
							<section>
								<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
									{[1, 2, 3, 4, 5].map((index) => (
										<Skeleton
											key={`${index}-highlight-skeleton-item`}
											className="h-26.5 rounded-lg"
										/>
									))}
								</div>
							</section>
						</section>
					}
				>
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">{t('nanoScarcityParity')}</h2>
							<ParitySettingsPopover />
						</div>
						<ParityHighlight />
					</section>
				</Suspense>

				{/* Main Parity Table */}
				<Suspense
					fallback={
						<section className="w-full overflow-x-auto">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-semibold">{t('scarcityParityMatrix')}</h2>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Loader className="h-4 w-4" />
									<span className="sr-only">{t('fiatCurrencySettings')}</span>
								</Button>
							</div>
							<ParityTableSkeleton />
						</section>
					}
				>
					<section className="w-full overflow-x-auto">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold">{t('scarcityParityMatrix')}</h2>
							<ParitySettingsPopover />
						</div>
						<ParityTable />
					</section>
				</Suspense>

				{/* Key Takeaway */}
				<Card className="border-primary/20">
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold mb-3">{t('keyTakeaway')}</h3>
						<p className="text-muted-foreground mb-4">
							{t.rich('keyTakeawayText', {
								highlight: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
							})}
						</p>
						<blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
							{t('blockquote')}
						</blockquote>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
