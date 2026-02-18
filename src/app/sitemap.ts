import type { MetadataRoute } from 'next'

import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { getNewsSlugs } from '@/lib/news'
import { getPartnersWithPages } from '@/lib/partner-config'

import { env } from '@/env'

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

type RouteConfig = {
	path: string
	changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
	priority: number
}

const routes: RouteConfig[] = [
	{ path: '', changeFrequency: 'hourly', priority: 1 },
	{ path: '/dominance', changeFrequency: 'hourly', priority: 0.9 },
	{ path: '/parity', changeFrequency: 'hourly', priority: 0.9 },
	{ path: '/speculation', changeFrequency: 'hourly', priority: 0.8 },
	{ path: '/calculators', changeFrequency: 'weekly', priority: 0.8 },
	{ path: '/get-nano', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/swap-nano', changeFrequency: 'weekly', priority: 0.8 },
	{ path: '/news', changeFrequency: 'daily', priority: 0.8 },
	{ path: '/legal/privacy', changeFrequency: 'monthly', priority: 0.3 },
	{ path: '/legal/terms', changeFrequency: 'monthly', priority: 0.3 },
	{ path: '/legal/cookies', changeFrequency: 'monthly', priority: 0.3 },
	{ path: '/legal/disclaimer', changeFrequency: 'monthly', priority: 0.3 },
	{ path: '/legal/imprint', changeFrequency: 'monthly', priority: 0.3 },
]

function buildAlternates(path: string): Record<string, string> {
	const alternates: Record<string, string> = {}
	for (const locale of LOCALES) {
		const localePath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
		alternates[locale] = `${SITE_URL}${localePath || '/'}`
	}
	return alternates
}

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	// Static routes
	const staticRoutes = routes.map(({ path, changeFrequency, priority }) => ({
		url: `${SITE_URL}${path || '/'}`,
		lastModified,
		changeFrequency,
		priority,
		alternates: {
			languages: buildAlternates(path),
		},
	}))

	// News article routes
	const newsSlugs = getNewsSlugs()
	const newsRoutes = newsSlugs.map((slug) => ({
		url: `${SITE_URL}/news/${slug}`,
		lastModified,
		changeFrequency: 'weekly' as const,
		priority: 0.6,
		alternates: {
			languages: buildAlternates(`/news/${slug}`),
		},
	}))

	// Partners page routes
	const partners = getPartnersWithPages()
	const partnersRoutes = partners.map((partner) => ({
		url: `${SITE_URL}/partners/${partner.id}`,
		lastModified,
		changeFrequency: 'monthly' as const,
		priority: 0.5,
		alternates: {
			languages: buildAlternates(`/partners/${partner.id}`),
		},
	}))

	return [...staticRoutes, ...newsRoutes, ...partnersRoutes]
}
