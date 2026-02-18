import type { Metadata } from 'next'
import { AlertTriangle, Info } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.legal.imprint' })

	return {
		title: t('title'),
		description: t('description'),
		alternates: { canonical: '/legal/imprint' },
	}
}

export default async function ImprintPage({ params }: Props) {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations({ locale, namespace: 'legal.imprint' })
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

				{/* Placeholder Warning */}
				{t('sections.operator.name').startsWith('[') && (
					<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
						<p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
							{t('sections.operator.placeholder')}
						</p>
					</div>
				)}

				{/* 1. Site Operator */}
				<section className="rounded-lg border border-border bg-card/60 p-5">
					<h2 className="text-xl font-semibold mb-4">{t('sections.operator.title')}</h2>
					<dl className="text-sm text-muted-foreground space-y-2">
						<div>
							<dt className="font-medium text-foreground">{t('sections.operator.responsible')}</dt>
							<dd>{t('sections.operator.name')}</dd>
						</div>
						<div>
							<dt className="font-medium text-foreground">Address:</dt>
							<dd>{t('sections.operator.address')}</dd>
							<dd>{t('sections.operator.country')}</dd>
						</div>
						<div>
							<dt className="font-medium text-foreground">{t('sections.operator.email')}</dt>
							<dd>
								<a href="mailto:contact@xnomarketcap.com" className="text-primary hover:underline">
									contact@xnomarketcap.com
								</a>
							</dd>
						</div>
					</dl>
				</section>

				{/* 2. Hosting */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.hosting.title')}</h2>
					<p className="text-muted-foreground">{t('sections.hosting.description')}</p>
				</section>

				{/* 3. Copyright */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.copyright.title')}</h2>
					<p className="text-muted-foreground">{t('sections.copyright.description')}</p>
				</section>

				{/* 4. Content Liability */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.contentLiability.title')}</h2>
					<p className="text-muted-foreground">{t('sections.contentLiability.description')}</p>
				</section>

				{/* 5. Link Liability */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.linkLiability.title')}</h2>
					<p className="text-muted-foreground">{t('sections.linkLiability.description')}</p>
				</section>

				{/* 6. Data Protection */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.dataProtection.title')}</h2>
					<p className="text-muted-foreground mb-2">{t('sections.dataProtection.description')}</p>
					<Link href="/legal/privacy" className="text-primary hover:underline text-sm font-medium">
						Privacy Policy →
					</Link>
				</section>

				{/* 7. Dispute Resolution */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.disputeResolution.title')}</h2>
					<p className="text-muted-foreground mb-2">{t('sections.disputeResolution.description')}</p>
					<a
						href={t('sections.disputeResolution.odrLink')}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline text-sm font-medium block mb-2"
					>
						{t('sections.disputeResolution.odrLink')}
					</a>
					<p className="text-sm text-muted-foreground">{t('sections.disputeResolution.note')}</p>
				</section>

				{/* Related Links */}
				<section className="border-t border-border pt-6">
					<p className="text-sm text-muted-foreground">
						See also:{' '}
						<Link href="/legal/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						{' · '}
						<Link href="/legal/terms" className="text-primary hover:underline">
							Terms of Service
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
