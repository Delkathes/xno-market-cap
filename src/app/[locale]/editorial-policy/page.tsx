import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { localePath } from '@/lib/seo'
import { breadcrumbNode, SITE, webPageNode, websiteNode } from '@/lib/structured-data'

import { HreflangLinks } from '@/components/hreflang-links'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.editorialPolicy' })

	return {
		title: { absolute: t('metaTitle') },
		description: t('metaDescription'),
		alternates: { canonical: localePath('/editorial-policy', locale) },
	}
}

export default async function EditorialPolicyPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.editorialPolicy' })
	const tc = await getTranslations({ locale, namespace: 'common' })
	const url = `${SITE}${localePath('/editorial-policy', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/editorial-policy" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							websiteNode(),
							webPageNode({ url, name: t('title'), locale }),
							breadcrumbNode(url, [
								{ name: tc('home'), url: `${SITE}${localePath('/', locale)}` },
								{ name: t('breadcrumb') },
							]),
						],
					}),
				}}
			/>

			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('title')}</h1>
			<div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground">
				<section>
					<h2 className="text-xl font-semibold text-foreground">{t('sourcingTitle')}</h2>
					<p className="mt-2">{t('sourcingBody')}</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">{t('correctionsTitle')}</h2>
					<p className="mt-2">
						{t.rich('correctionsBody', {
							link: (chunks) => (
								<Link href="/contact" className="text-primary underline underline-offset-4">
									{chunks}
								</Link>
							),
						})}
					</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">{t('independenceTitle')}</h2>
					<p className="mt-2">{t('independenceBody')}</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">{t('researchTitle')}</h2>
					<p className="mt-2">{t('researchBody')}</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">{t('contactTitle')}</h2>
					<p className="mt-2">
						{t.rich('contactBody', {
							link: (chunks) => (
								<Link href="/contact" className="text-primary underline underline-offset-4">
									{chunks}
								</Link>
							),
						})}
					</p>
				</section>
			</div>
		</main>
	)
}
