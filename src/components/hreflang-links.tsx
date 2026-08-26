import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { localePath } from '@/lib/seo'

import { env } from '@/env'

/**
 * Per-page hreflang alternates + x-default, rendered explicitly.
 * With cacheComponents, `metadata.alternates.languages` is not emitted into
 * the HTML, so each page renders its own locale links instead.
 */
export function HreflangLinks({ path }: { path: string }) {
	const siteUrl = env.NEXT_PUBLIC_SITE_URL

	return (
		<>
			{LOCALES.map((locale) => (
				<link key={locale} rel="alternate" hrefLang={locale} href={`${siteUrl}${localePath(path, locale)}`} />
			))}
			<link rel="alternate" hrefLang="x-default" href={`${siteUrl}${localePath(path, DEFAULT_LOCALE)}`} />
		</>
	)
}
