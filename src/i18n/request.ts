import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async () => {
	// Read the [locale] segment from the root layout (Next 16.3 root params)
	const paramValue = await rootParams.locale()

	// Runtime validation for unknown locales
	if (!hasLocale(routing.locales, paramValue)) {
		notFound()
	}
	const locale = paramValue

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	}
})
