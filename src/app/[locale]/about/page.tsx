import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { localePath } from '@/lib/seo'
import { breadcrumbNode, organizationNode, SITE, webPageNode, websiteNode } from '@/lib/structured-data'

import { HreflangLinks } from '@/components/hreflang-links'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.about' })

	return {
		title: { absolute: t('metaTitle') },
		description: t('metaDescription'),
		alternates: { canonical: localePath('/about', locale) },
	}
}

export default async function AboutPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.about' })
	const tc = await getTranslations({ locale, namespace: 'common' })
	const url = `${SITE}${localePath('/about', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/about" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							organizationNode(),
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
			<div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
				<p>{t('intro')}</p>
				<p>{t('ledger')}</p>
				<p>
					{t.rich('independence', {
						link: (chunks) => (
							<Link href="/legal/disclaimer" className="text-primary underline underline-offset-4">
								{chunks}
							</Link>
						),
					})}
				</p>
			</div>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">{t('methodologyTitle')}</h2>
				<ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
					<li>{t('methodology1')}</li>
					<li>{t('methodology2')}</li>
					<li>{t('methodology3')}</li>
					<li>{t('methodology4')}</li>
					<li>{t('methodology5')}</li>
					<li>{t('methodology6')}</li>
				</ul>
			</section>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">{t('newsTitle')}</h2>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">{t('newsBody')}</p>
			</section>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">{t('editorialTitle')}</h2>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">
					{t.rich('editorialBody', {
						policy: (chunks) => (
							<Link href="/editorial-policy" className="text-primary underline underline-offset-4">
								{chunks}
							</Link>
						),
						contact: (chunks) => (
							<Link href="/contact" className="text-primary underline underline-offset-4">
								{chunks}
							</Link>
						),
					})}
				</p>
			</section>
		</main>
	)
}
