import { DEFAULT_LOCALE } from '@/lib/constants'

/** Shared default OG image (relative — resolved against metadataBase). */
const OG_IMAGE = {
	url: '/og-image.jpg',
	width: 1200,
	height: 630,
	alt: 'NanoMarketCap',
} as const

/**
 * OpenGraph images entry for pages that override openGraph. Setting a custom
 * openGraph object on a page DROPS the layout's openGraph fields, including
 * images — every page-level openGraph must re-declare them.
 */
export function ogImage(): { url: string; width: number; height: number; alt: string }[] {
	return [{ ...OG_IMAGE }]
}

const OG_LOCALES: Record<string, string> = {
	en: 'en_US',
	fr: 'fr_FR',
	de: 'de_DE',
	es: 'es_ES',
	it: 'it_IT',
	nl: 'nl_NL',
}

/** OpenGraph locale for a site locale (og:locale expects xx_XX). */
export function ogLocale(locale: string): string {
	return OG_LOCALES[locale] ?? 'en_US'
}

/**
 * Locale-aware URL path: the default locale has no prefix, others do.
 * Used for self-referencing canonicals and hreflang hrefs.
 */
export function localePath(path: string, locale: string = DEFAULT_LOCALE): string {
	if (path === '/') {
		return locale === DEFAULT_LOCALE ? '/' : `/${locale}`
	}
	return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
}
