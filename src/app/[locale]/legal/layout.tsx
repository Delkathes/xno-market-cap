import { cacheLife } from 'next/cache'
import type { ReactNode } from 'react'

export default async function LegalLayout({ children }: { children: ReactNode }) {
	'use cache'
	cacheLife('max')

	return <>{children}</>
}
