import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'
import { Calculator, Loader2 } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingArea } from '@/components/loading-area'
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

export default async function CalculatorsPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	setRequestLocale(locale)

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="grid gap-14">
				<Suspense
					fallback={
						<div className="h-420.25 relative">
							<div className="h-2/3 relative">
								<LoadingArea />
							</div>
						</div>
					}
				>
					<AbsoluteParityCalculator locale={(await params).locale} />
					<ParityCalculator />
					<SpeculationCalculator />
				</Suspense>
			</div>
		</main>
	)
}

async function AbsoluteParityCalculator({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'parity' })

	return (
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
	)
}

async function _ParityHighlightCalculatorSkeleton() {
	return (
		<Card className="gap-2">
			<CardHeader className="flex justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-[#209CE9]" />
						<Skeleton className="h-5 w-44" />
					</CardTitle>
					<CardDescription className="relative pt-1 max-w-full">
						<Skeleton className="h-4 w-80 max-w-full sm:w-120" />
						<Skeleton className="h-4 w-60 mt-1 sm:hidden" />
					</CardDescription>
				</div>
				<Button variant="ghost" size="icon" className="h-8 w-8 flex-none cursor-pointer">
					<Loader2 className="h-4 w-4 animate-spin" />
				</Button>
			</CardHeader>
			<CardContent className="pb-4 px-4">
				<section>
					<div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
						{[1, 2, 3, 4, 5].map((index) => (
							<Skeleton key={`${index}-highlight-skeleton-item`} className="h-26.5 rounded-lg" />
						))}
					</div>
				</section>
			</CardContent>
		</Card>
	)
}

function _ParityCalculatorSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-[#209CE9]" />
						<Skeleton className="h-5 w-40" />
					</CardTitle>
					<CardDescription className="relative pt-1">
						<Skeleton className="h-4 w-100" />
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 pb-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
				</div>
				<Skeleton className="h-32" />
				<Skeleton className="h-24" />
			</CardContent>
		</Card>
	)
}

function _SpeculationCalculatorSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-72" />
			</CardHeader>
			<CardContent className="space-y-6">
				<Skeleton className="h-20" />
				<Skeleton className="h-12" />
				<Skeleton className="h-40" />
			</CardContent>
		</Card>
	)
}
