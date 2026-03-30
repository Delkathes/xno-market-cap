import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.legal.disclaimer' })

	return {
		title: t('title'),
		description: t('description'),
		alternates: { canonical: '/legal/disclaimer' },
	}
}

export default async function DisclaimerPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'legal.disclaimer' })
	const tLegal = await getTranslations({ locale, namespace: 'legal' })

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<div className="mb-2">
				<p className="text-sm text-muted-foreground">{tLegal('lastUpdated', { date: 'February 16, 2026' })}</p>
			</div>
			<h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>

			<div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
				<p className="text-muted-foreground leading-relaxed">{t('intro')}</p>

				{/* 1. Not Financial Advice — highlighted */}
				<section className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
						<div>
							<h2 className="text-xl font-semibold mb-2">{t('sections.notFinancialAdvice.title')}</h2>
							<p className="text-muted-foreground">{t('sections.notFinancialAdvice.description')}</p>
						</div>
					</div>
				</section>

				{/* 2. No Recommendation */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.noRecommendation.title')}</h2>
					<p className="text-muted-foreground">{t('sections.noRecommendation.description')}</p>
				</section>

				{/* 3. Data Accuracy */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataAccuracy.title')}</h2>
					<p className="text-muted-foreground">{t('sections.dataAccuracy.description')}</p>
				</section>

				{/* 4. Crypto Risk Warning — highlighted */}
				<section className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
						<div>
							<h2 className="text-xl font-semibold mb-2">{t('sections.cryptoRisk.title')}</h2>
							<p className="text-muted-foreground">{t('sections.cryptoRisk.description')}</p>
						</div>
					</div>
				</section>

				{/* 5. Third-Party Services */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.thirdPartyServices.title')}</h2>
					<p className="text-muted-foreground">{t('sections.thirdPartyServices.description')}</p>
				</section>

				{/* 6. Affiliate Disclosure */}
				<section className="rounded-lg border border-border bg-card/60 p-5">
					<h2 className="text-xl font-semibold mb-3">{t('sections.affiliateDisclosure.title')}</h2>
					<p className="text-muted-foreground">{t('sections.affiliateDisclosure.description')}</p>
				</section>

				{/* 7. No Guarantees */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.noGuarantees.title')}</h2>
					<p className="text-muted-foreground">{t('sections.noGuarantees.description')}</p>
				</section>

				{/* 8. Limitation of Liability */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.liability.title')}</h2>
					<p className="text-muted-foreground">{t('sections.liability.description')}</p>
				</section>

				{/* 9. DYOR */}
				<section className="rounded-lg border border-primary/20 bg-primary/5 p-5">
					<h2 className="text-xl font-semibold mb-3">{t('sections.ownResearch.title')}</h2>
					<p className="text-muted-foreground">{t('sections.ownResearch.description')}</p>
				</section>

				{/* Related Links */}
				<section className="border-t border-border pt-6">
					<p className="text-sm text-muted-foreground">
						See also:{' '}
						<Link href="/legal/terms" className="text-primary hover:underline">
							Terms of Service
						</Link>
						{' · '}
						<Link href="/legal/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						{' · '}
						<Link href="/legal/imprint" className="text-primary hover:underline">
							Legal Notice
						</Link>
					</p>
				</section>
			</div>
		</main>
	)
}
