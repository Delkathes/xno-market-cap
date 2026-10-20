import { env } from '@/env'

export const SITE = env.NEXT_PUBLIC_SITE_URL
export const ORGANIZATION_ID = `${SITE}/#organization`
export const WEBSITE_ID = `${SITE}/#website`
export const LOGO_URL = `${SITE}/apple-icon.png`

export function organizationNode() {
	return {
		'@type': 'Organization',
		'@id': ORGANIZATION_ID,
		name: 'NanoMarketCap',
		alternateName: 'NMC',
		url: SITE,
		description: 'Independent Nano (XNO) market data, on-chain analytics, and ecosystem news.',
		logo: {
			'@type': 'ImageObject',
			'@id': `${SITE}/#logo`,
			url: LOGO_URL,
			contentUrl: LOGO_URL,
			width: 180,
			height: 180,
			caption: 'NanoMarketCap',
		},
		sameAs: ['https://github.com/Delkathes/xno-market-cap'],
	}
}

export function websiteNode() {
	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: SITE,
		name: 'NanoMarketCap',
		publisher: { '@id': ORGANIZATION_ID },
	}
}

export function webPageNode({
	url,
	name,
	locale,
	description,
}: {
	url: string
	name: string
	locale: string
	description?: string
}) {
	return {
		'@type': 'WebPage',
		'@id': url,
		url,
		name,
		description,
		inLanguage: locale,
		isPartOf: { '@id': WEBSITE_ID },
	}
}

export function breadcrumbNode(url: string, items: { name: string; url?: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		'@id': `${url}#breadcrumb`,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			...(item.url ? { item: item.url } : {}),
		})),
	}
}
