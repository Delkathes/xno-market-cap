import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata.legal.cookies' })

	return {
		title: t('title'),
		description: t('description'),
		alternates: { canonical: '/legal/cookies' },
	}
}

export default async function CookiePolicyPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params

	const t = await getTranslations({ locale, namespace: 'legal.cookies' })
	const tLegal = await getTranslations({ locale, namespace: 'legal' })

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<div className="mb-2">
				<p className="text-sm text-muted-foreground">{tLegal('lastUpdated', { date: 'February 16, 2026' })}</p>
			</div>
			<h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>

			<div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
				<p className="text-muted-foreground leading-relaxed">{t('intro')}</p>

				{/* 1. What Are Cookies & Local Storage */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.whatAreCookies.title')}</h2>
					<p className="text-muted-foreground">{t('sections.whatAreCookies.description')}</p>
				</section>

				{/* 2. What We Use */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.whatWeUse.title')}</h2>

					{/* Functional Cookies */}
					<div className="rounded-lg border border-border bg-card/60 p-4 mb-4">
						<h3 className="text-base font-medium mb-2">{t('sections.whatWeUse.functional.title')}</h3>
						<p className="text-sm text-muted-foreground mb-3">
							{t('sections.whatWeUse.functional.description')}
						</p>
						<ul className="text-sm text-muted-foreground space-y-2">
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									NEXT_LOCALE
								</code>
								<span>{t('sections.whatWeUse.functional.items.locale').split(' — ')[1]}</span>
							</li>
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									theme
								</code>
								<span>{t('sections.whatWeUse.functional.items.theme').split(' — ')[1]}</span>
							</li>
						</ul>
					</div>

					{/* Local Storage */}
					<div className="rounded-lg border border-border bg-card/60 p-4">
						<h3 className="text-base font-medium mb-2">{t('sections.whatWeUse.localStorage.title')}</h3>
						<p className="text-sm text-muted-foreground mb-3">
							{t('sections.whatWeUse.localStorage.description')}
						</p>
						<ul className="text-sm text-muted-foreground space-y-2">
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									xno-market-primary-fiat
								</code>
								<span>{t('sections.whatWeUse.localStorage.items.primaryFiat').split(' — ')[1]}</span>
							</li>
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									xno-market-secondary-fiat
								</code>
								<span>{t('sections.whatWeUse.localStorage.items.secondaryFiat').split(' — ')[1]}</span>
							</li>
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									xno-market-crypto
								</code>
								<span>{t('sections.whatWeUse.localStorage.items.cryptoRef').split(' — ')[1]}</span>
							</li>
							<li className="flex gap-2">
								<code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
									xno-parity-fiat-currencies
								</code>
								<span>{t('sections.whatWeUse.localStorage.items.parityFiat').split(' — ')[1]}</span>
							</li>
						</ul>
					</div>
				</section>

				{/* 3. Third-Party Cookies */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.thirdParty.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.thirdParty.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.thirdParty.items.nanswap')}</li>
					</ul>
					<p className="text-sm text-muted-foreground mt-3">{t('sections.thirdParty.fontsNote')}</p>
				</section>

				{/* 4. No Tracking Cookies */}
				<section className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
					<h2 className="text-xl font-semibold mb-3">{t('sections.noTracking.title')}</h2>
					<p className="text-muted-foreground">{t('sections.noTracking.description')}</p>
				</section>

				{/* 5. Managing Your Preferences */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.manage.title')}</h2>
					<p className="text-muted-foreground mb-3">{t('sections.manage.description')}</p>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
						<li>{t('sections.manage.items.clearCookies')}</li>
						<li>{t('sections.manage.items.clearStorage')}</li>
						<li>{t('sections.manage.items.blockCookies')}</li>
					</ul>
				</section>

				{/* 6. Retention Periods */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.retention.title')}</h2>
					<p className="text-muted-foreground">{t('sections.retention.description')}</p>
				</section>

				{/* 7. Changes */}
				<section>
					<h2 className="text-xl font-semibold mb-3">{t('sections.changes.title')}</h2>
					<p className="text-muted-foreground">{t('sections.changes.description')}</p>
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
					</p>
				</section>
			</div>
		</main>
	)
}
