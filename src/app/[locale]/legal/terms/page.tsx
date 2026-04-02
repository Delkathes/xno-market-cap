import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.legal.terms' })

	return {
		title: t('title'),
		description: t('description'),
		alternates: { canonical: '/legal/terms' },
	}
}

export default async function TermsOfServicePage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'legal.terms' })
	const tLegal = await getTranslations({ locale, namespace: 'legal' })

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<div className="mb-2">
				<p className="text-sm text-muted-foreground">{tLegal('lastUpdated', { date: 'February 16, 2026' })}</p>
			</div>
			<h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>

			<div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
				<p className="text-muted-foreground leading-relaxed">{t('intro')}</p>

				{/* 1. Eligibility */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.eligibility.title')}</h2>
					<p className="text-muted-foreground">{t('sections.eligibility.description')}</p>
				</section>

				{/* 2. Service Description */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.serviceDescription.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.serviceDescription.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.serviceDescription.items.marketData')}</li>
						<li>{t('sections.serviceDescription.items.tools')}</li>
						<li>{t('sections.serviceDescription.items.swapAccess')}</li>
						<li>{t('sections.serviceDescription.items.educational')}</li>
						<li>{t('sections.serviceDescription.items.donations')}</li>
					</ul>
				</section>

				{/* 3. Not Financial Advice */}
				<section className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
					<h2 className="text-xl font-semibold mb-3">{t('sections.noFinancialAdvice.title')}</h2>
					<p className="text-muted-foreground">{t('sections.noFinancialAdvice.description')}</p>
				</section>

				{/* 4. Data Accuracy */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataAccuracy.title')}</h2>
					<p className="text-muted-foreground">{t('sections.dataAccuracy.description')}</p>
				</section>

				{/* 5. Third-Party Services */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.thirdPartyServices.title')}</h2>
					<p className="text-muted-foreground">{t('sections.thirdPartyServices.description')}</p>
				</section>

				{/* 6. Donations */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.donations.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.donations.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.donations.items.voluntary')}</li>
						<li>{t('sections.donations.items.nonRefundable')}</li>
						<li>{t('sections.donations.items.noTaxReceipt')}</li>
						<li>{t('sections.donations.items.noObligation')}</li>
						<li>{t('sections.donations.items.noGuarantee')}</li>
					</ul>
				</section>

				{/* 7. Partner Content */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.partnerContent.title')}</h2>
					<p className="text-muted-foreground">{t('sections.partnerContent.description')}</p>
				</section>

				{/* 8. Intellectual Property */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.intellectualProperty.title')}</h2>
					<p className="text-muted-foreground">{t('sections.intellectualProperty.description')}</p>
				</section>

				{/* 9. Prohibited Use */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.prohibitedUse.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.prohibitedUse.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.prohibitedUse.items.abuse')}</li>
						<li>{t('sections.prohibitedUse.items.scrape')}</li>
						<li>{t('sections.prohibitedUse.items.circumvent')}</li>
						<li>{t('sections.prohibitedUse.items.misrepresent')}</li>
						<li>{t('sections.prohibitedUse.items.illegal')}</li>
					</ul>
				</section>

				{/* 10. Limitation of Liability */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.limitation.title')}</h2>
					<p className="text-muted-foreground">{t('sections.limitation.description')}</p>
				</section>

				{/* 11. Indemnification */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.indemnification.title')}</h2>
					<p className="text-muted-foreground">{t('sections.indemnification.description')}</p>
				</section>

				{/* 12. Modification & Termination */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.modification.title')}</h2>
					<p className="text-muted-foreground">{t('sections.modification.description')}</p>
				</section>

				{/* 13. Governing Law */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.governing.title')}</h2>
					<p className="text-muted-foreground">{t('sections.governing.description')}</p>
				</section>

				{/* 14. Force Majeure */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.forceMajeure.title')}</h2>
					<p className="text-muted-foreground">{t('sections.forceMajeure.description')}</p>
				</section>

				{/* 15. Severability */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.severability.title')}</h2>
					<p className="text-muted-foreground">{t('sections.severability.description')}</p>
				</section>

				{/* 16. Entire Agreement */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.entireAgreement.title')}</h2>
					<p className="text-muted-foreground">{t('sections.entireAgreement.description')}</p>
				</section>

				{/* 17. Waiver */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.waiver.title')}</h2>
					<p className="text-muted-foreground">{t('sections.waiver.description')}</p>
				</section>

				{/* 18. Contact */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.contact.title')}</h2>
					<p className="text-muted-foreground mb-2">{t('sections.contact.description')}</p>
					<a
						href="mailto:contact@xnomarketcap.com"
						className="text-primary hover:underline text-sm font-medium"
					>
						contact@xnomarketcap.com
					</a>
				</section>

				{/* Related Links */}
				<section className="border-t border-border pt-6">
					<p className="text-sm text-muted-foreground">
						See also:{' '}
						<Link href="/legal/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						{' · '}
						<Link href="/legal/disclaimer" className="text-primary hover:underline">
							Disclaimer
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
