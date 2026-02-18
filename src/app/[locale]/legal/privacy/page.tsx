import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.legal.privacy' })

	return {
		title: t('title'),
		description: t('description'),
		alternates: { canonical: '/legal/privacy' },
	}
}

export default async function PrivacyPolicyPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'legal.privacy' })
	const tLegal = await getTranslations({ locale, namespace: 'legal' })

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<div className="mb-2">
				<p className="text-sm text-muted-foreground">{tLegal('lastUpdated', { date: 'February 16, 2026' })}</p>
			</div>
			<h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>

			<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 mb-8 flex items-start gap-3">
				<Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
				<p className="text-sm text-muted-foreground">{tLegal('englishOnly')}</p>
			</div>

			<div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
				<p className="text-muted-foreground leading-relaxed">{t('intro')}</p>

				{/* 1. Information We Collect */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataCollected.title')}</h2>
					<p className="text-muted-foreground mb-4">{t('sections.dataCollected.description')}</p>

					<div className="space-y-4">
						<div className="rounded-lg border border-border bg-card/60 p-4">
							<h3 className="font-semibold mb-2">{t('sections.dataCollected.ipAddresses.title')}</h3>
							<p className="text-sm text-muted-foreground">
								{t('sections.dataCollected.ipAddresses.description')}
							</p>
						</div>

						<div className="rounded-lg border border-border bg-card/60 p-4">
							<h3 className="font-semibold mb-2">{t('sections.dataCollected.localStorage.title')}</h3>
							<p className="text-sm text-muted-foreground mb-3">
								{t('sections.dataCollected.localStorage.description')}
							</p>
							<ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
								<li>{t('sections.dataCollected.localStorage.items.primaryFiat')}</li>
								<li>{t('sections.dataCollected.localStorage.items.secondaryFiat')}</li>
								<li>{t('sections.dataCollected.localStorage.items.cryptoRef')}</li>
								<li>{t('sections.dataCollected.localStorage.items.parityFiat')}</li>
								<li>{t('sections.dataCollected.localStorage.items.theme')}</li>
							</ul>
						</div>

						<div className="rounded-lg border border-border bg-card/60 p-4">
							<h3 className="font-semibold mb-2">{t('sections.dataCollected.cookies.title')}</h3>
							<p className="text-sm text-muted-foreground mb-3">
								{t('sections.dataCollected.cookies.description')}
							</p>
							<ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
								<li>
									<code className="text-xs bg-muted px-1 py-0.5 rounded">
										{t('sections.dataCollected.cookies.items.locale')}
									</code>
								</li>
								<li>
									<code className="text-xs bg-muted px-1 py-0.5 rounded">
										{t('sections.dataCollected.cookies.items.theme')}
									</code>
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* 2. What We Do NOT Collect */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.noTracking.title')}</h2>
					<p className="text-muted-foreground">{t('sections.noTracking.description')}</p>
				</section>

				{/* 3. Third-Party Services */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.thirdParty.title')}</h2>
					<p className="text-muted-foreground mb-4">{t('sections.thirdParty.description')}</p>

					<div className="space-y-3">
						{(['coingecko', 'nanswap', 'nanoNodes', 'fonts', 'imageCdns'] as const).map((key) => (
							<div key={key} className="rounded-lg border border-border bg-card/60 p-4">
								<h3 className="font-semibold text-sm mb-1">{t(`sections.thirdParty.${key}.title`)}</h3>
								<p className="text-sm text-muted-foreground">
									{t(`sections.thirdParty.${key}.description`)}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* 4. Legal Basis (GDPR) */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.legalBasis.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.legalBasis.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.legalBasis.items.legitimateInterest')}</li>
						<li>{t('sections.legalBasis.items.functionalCookies')}</li>
						<li>{t('sections.legalBasis.items.consent')}</li>
					</ul>
				</section>

				{/* 5. Your Rights */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataRights.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.dataRights.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.dataRights.items.access')}</li>
						<li>{t('sections.dataRights.items.rectification')}</li>
						<li>{t('sections.dataRights.items.erasure')}</li>
						<li>{t('sections.dataRights.items.restriction')}</li>
						<li>{t('sections.dataRights.items.portability')}</li>
						<li>{t('sections.dataRights.items.objection')}</li>
						<li>{t('sections.dataRights.items.withdrawConsent')}</li>
					</ul>
					<p className="text-sm text-muted-foreground mt-3">{t('sections.dataRights.note')}</p>
				</section>

				{/* 6. Right to Lodge a Complaint */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.supervisoryAuthority.title')}</h2>
					<p className="text-muted-foreground mb-2">{t('sections.supervisoryAuthority.description')}</p>
					<p className="text-muted-foreground mb-1">{t('sections.supervisoryAuthority.cnil')}</p>
					<a
						href={t('sections.supervisoryAuthority.cnilLink')}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline text-sm font-medium"
					>
						{t('sections.supervisoryAuthority.cnilLink')}
					</a>
					<p className="text-sm text-muted-foreground mt-2">{t('sections.supervisoryAuthority.note')}</p>
				</section>

				{/* 7. Data Breach Notification */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataBreach.title')}</h2>
					<p className="text-muted-foreground">{t('sections.dataBreach.description')}</p>
				</section>

				{/* 8. International Data Transfers */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.internationalTransfers.title')}</h2>
					<p className="text-muted-foreground">{t('sections.internationalTransfers.description')}</p>
				</section>

				{/* 9. Data Retention */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataRetention.title')}</h2>
					<p className="text-muted-foreground">{t('sections.dataRetention.description')}</p>
				</section>

				{/* 10. Children's Privacy */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.children.title')}</h2>
					<p className="text-muted-foreground">{t('sections.children.description')}</p>
				</section>

				{/* 11. Changes */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.changes.title')}</h2>
					<p className="text-muted-foreground">{t('sections.changes.description')}</p>
				</section>

				{/* 12. Contact */}
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
						<Link href="/legal/terms" className="text-primary hover:underline">
							Terms of Service
						</Link>
						{' · '}
						<Link href="/legal/cookies" className="text-primary hover:underline">
							Cookie Policy
						</Link>
						{' · '}
						<Link href="/legal/disclaimer" className="text-primary hover:underline">
							Disclaimer
						</Link>
					</p>
				</section>
			</div>
		</main>
	)
}
