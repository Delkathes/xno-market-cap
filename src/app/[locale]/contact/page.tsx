import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

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
	const t = await getTranslations({ locale, namespace: 'trustPages.contact' })

	return {
		title: { absolute: t('metaTitle') },
		description: t('metaDescription'),
		alternates: { canonical: localePath('/contact', locale) },
	}
}

export default async function ContactPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.contact' })
	const tc = await getTranslations({ locale, namespace: 'common' })
	const url = `${SITE}${localePath('/contact', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/contact" />
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
			<div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
				<p>{t('intro')}</p>
				<p>
					<a
						href="https://github.com/Delkathes/xno-market-cap/issues"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-primary underline underline-offset-4"
					>
						{t('issueLink')}
					</a>
				</p>
				<p>{t('noAdvice')}</p>
			</div>
		</main>
	)
}
