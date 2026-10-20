import type { MetadataRoute } from 'next'

import { CRYPTO_IDS, DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { getAllNews } from '@/lib/news'
import { getPartnersWithPages } from '@/lib/partner-config'

import { env } from '@/env'

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

const routes = [
	'',
	'/dominance',
	'/parity',
	'/speculation',
	'/calculators',
	'/explore',
	'/widgets',
	'/get-nano',
	'/swap-nano',
	'/news',
	'/why-nano',
	'/decentralization',
	'/milestones',
	'/tools/unit-converter',
	'/tools/payment-links',
	'/tools/address-tools',
	'/tools/account-inspector',
	'/tools/fee-comparison',
	'/partners/info',
	'/about',
	'/contact',
	'/authors',
	'/editorial-policy',
	'/legal/privacy',
	'/legal/terms',
	'/legal/cookies',
	'/legal/disclaimer',
	'/legal/imprint',
] as const

function buildAlternates(path: string): Record<string, string> {
	const alternates: Record<string, string> = {}
	for (const locale of LOCALES) {
		const localePath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
		alternates[locale] = `${SITE_URL}${localePath || '/'}`
	}
	alternates['x-default'] = `${SITE_URL}${path || '/'}`
	return alternates
}

function routeEntry(path: string): MetadataRoute.Sitemap[number] {
	return {
		url: `${SITE_URL}${path || '/'}`,
		alternates: {
			languages: buildAlternates(path),
		},
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticRoutes = routes.map(routeEntry)

	const coinRoutes = Object.values(CRYPTO_IDS).map((id) => routeEntry(`/coin/${id}`))

	const newsArticles = await getAllNews()
	const newsRoutes = newsArticles.map((article) => ({
		url: `${SITE_URL}/news/${article.slug}`,
		lastModified: new Date(article.updated ?? article.date),
		alternates: {
			languages: buildAlternates(`/news/${article.slug}`),
		},
	}))

	const partners = getPartnersWithPages()
	const partnersRoutes = partners.map((partner) => routeEntry(`/partners/${partner.id}`))

	return [...staticRoutes, ...coinRoutes, ...newsRoutes, ...partnersRoutes]
}
