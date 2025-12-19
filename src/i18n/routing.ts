import { defineRouting } from 'next-intl/routing'

import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'

export const routing = defineRouting({
	locales: LOCALES,
	defaultLocale: DEFAULT_LOCALE,
	localePrefix: 'as-needed',
	localeDetection: true,
})

export type Locale = (typeof routing.locales)[number]
