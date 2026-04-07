import { cacheLife } from 'next/cache'
import type { ReactNode } from 'react'
import { setRequestLocale } from 'next-intl/server'

type Props = {
	children: ReactNode
	params: Promise<{ locale: string }>
}

export default async function LegalLayout({ children, params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	setRequestLocale(locale)

	return <>{children}</>
}
