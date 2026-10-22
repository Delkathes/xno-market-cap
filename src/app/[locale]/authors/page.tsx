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
	const t = await getTranslations({ locale, namespace: 'trustPages.authors' })

	return {
		title: { absolute: t('metaTitle') },
		description: t('metaDescription'),
		alternates: { canonical: localePath('/authors', locale) },
	}
}

export default async function AuthorsPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'trustPages.authors' })
	const tc = await getTranslations({ locale, namespace: 'common' })
	const url = `${SITE}${localePath('/authors', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/authors" />
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
			<section className="mt-8 rounded-md border bg-card p-6">
				<h2 className="text-xl font-semibold">{t('teamName')}</h2>
				<p className="mt-2 text-sm leading-7 text-muted-foreground">{t('body')}</p>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">
					{t.rich('policyBody', {
						link: (chunks) => (
							<Link href="/editorial-policy" className="text-primary underline underline-offset-4">
								{chunks}
							</Link>
						),
					})}
				</p>
			</section>
		</main>
	)
}
