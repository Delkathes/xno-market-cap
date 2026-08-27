import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { type DecentralizationData, getDecentralizationData } from '@/lib/decentralization-service'
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
	const t = await getTranslations({ locale, namespace: 'decentralization' })

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('ogTitle'),
			description: t('ogDescription'),
			url: '/decentralization',
			type: 'website',
			locale: ogLocale(locale),
			images: ogImage(),
		},
		alternates: {
			canonical: localePath('/decentralization', locale),
		},
	}
}

export default async function DecentralizationPage({ params }: Props) {
	'use cache'
	cacheLife({ revalidate: 3600 })

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'decentralization' })

	let data: DecentralizationData | null = null
	let fetchFailed = false
	try {
		data = await getDecentralizationData()
	} catch (error) {
		console.error('Failed to fetch decentralization data:', error)
		fetchFailed = true
	}

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path="/decentralization" />
			<ModernPageBackground />

			{/* Hero */}
			<header className="mb-10 animate-fade-in-up">
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-3">{t('h1')}</h1>
				<p className="text-muted-foreground text-base sm:text-lg max-w-2xl">{t('intro')}</p>
			</header>

			<div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				{fetchFailed && (
					<div className="rounded-md border border-dashed border-primary/25 bg-primary/5 px-4 py-3 text-sm">
						{t('failedNotice')}
					</div>
				)}

				{data && <StatsGrid data={data} t={t} />}

				{data && data.topReps.length > 0 && (
					<section>
						<h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
							{t('topRepsTitle')}
						</h2>
						<div className="relative max-h-150 overflow-auto rounded-md border border-border bg-card">
							<table className="w-full">
								<thead className="sticky top-0 z-10 border-b border-border bg-card">
									<tr className="text-foreground text-sm">
										<th className="px-3 py-2 text-left">
											<span className="text-muted-foreground">#</span>
										</th>
										<th className="px-3 py-2 pl-0 text-left sm:pl-4">{t('repColumn')}</th>
										<th className="px-3 py-2 text-right">{t('weightColumn')}</th>
										<th className="px-3 py-2 text-right">{t('shareColumn')}</th>
									</tr>
								</thead>
								<tbody>
									{(() => {
										const maxShare = data.topReps[0]?.share ?? 0
										return data.topReps.map((rep, index) => (
											<tr key={rep.address} className="border-b border-border">
												<td className="px-3 py-2 text-muted-foreground tabular-nums text-sm">
													{index + 1}
												</td>
												<td className="px-3 py-2 pl-0 sm:pl-4">
													<span className="font-mono text-sm break-all" title={rep.address}>
														{shortenAddress(rep.address)}
													</span>
												</td>
												<td className="px-3 py-2 text-right text-sm tabular-nums whitespace-nowrap">
													{formatWeight(rep.weightXno)} XNO
												</td>
												<td className="px-3 py-2 text-right">
													<div className="flex items-center justify-end gap-2">
														<div className="hidden sm:block h-1 w-20 overflow-hidden rounded-full bg-muted">
															<div
																className="h-full rounded-full bg-primary"
																style={{
																	width: `${maxShare > 0 ? (rep.share / maxShare) * 100 : 0}%`,
																}}
															/>
														</div>
														<span className="text-sm tabular-nums text-muted-foreground">
															{(rep.share * 100).toLocaleString(undefined, {
																maximumFractionDigits: 2,
															})}
															%
														</span>
													</div>
												</td>
											</tr>
										))
									})()}
								</tbody>
							</table>
						</div>
					</section>
				)}

				<p className="text-xs text-muted-foreground/70">{t('updatedNote')}</p>
			</div>
		</main>
	)
}

type Translator = Awaited<ReturnType<typeof getTranslations>>

function StatsGrid({ data, t }: { data: DecentralizationData; t: Translator }) {
	const stats = [
		{
			label: t('onlineWeight'),
			value: `${formatWeight(data.onlineWeightXno)} XNO`,
			hint: t('onlineWeightHint'),
		},
		{
			label: t('principalReps'),
			value: data.principalReps.toLocaleString(),
			hint: `${(data.principalWeightShare * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}% ${t('principalWeightOfOnline')}`,
		},
		{
			label: t('top10Share'),
			value: `${(data.top10Share * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
			hint: t('top10ShareHint'),
		},
		{
			label: t('gini'),
			value: data.gini.toFixed(2),
			hint: t('giniHint'),
		},
	]

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{stats.map((stat) => (
				<div key={stat.label} className="rounded-md border bg-card p-4">
					<div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
						{stat.label}
					</div>
					<div className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight tabular-nums">{stat.value}</div>
					<div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>
				</div>
			))}
		</div>
	)
}

function shortenAddress(address: string): string {
	if (address.length <= 24) return address
	return `${address.slice(0, 13)}...${address.slice(-6)}`
}

function formatWeight(weight: number): string {
	if (weight >= 1_000_000) {
		return `${(weight / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
	}
	if (weight >= 1_000) {
		return `${(weight / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
	}
	return weight.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
