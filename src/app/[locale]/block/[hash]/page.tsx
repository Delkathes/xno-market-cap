import type { Metadata, Route } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'

import { getAccountLabels } from '@/lib/account-labels'
import { getBlockDetails } from '@/lib/block-data-service'
import { isValidBlockHash } from '@/lib/nano-utils'
import { localePath, ogLocale } from '@/lib/seo'

import { env } from '@/env'

import { BlockView } from '@/components/block/block-view'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string; hash: string }>
}

// Blocking route: block data must be in the initial HTML (SSR) and the page
// redirects malformed/mixed-case hashes per request. instant=false is the
// legal flag for that alongside cacheComponents (force-dynamic is not).
export const instant = false

function truncateHash(hash: string): string {
	return `${hash.slice(0, 12)}…${hash.slice(-6)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	await connection()

	const { locale, hash } = await params
	if (!isValidBlockHash(hash)) {
		return {
			title: 'Invalid block hash',
			robots: { index: false, follow: false },
		}
	}

	const t = await getTranslations({ locale, namespace: 'metadata.block' })
	const short = truncateHash(hash)

	const details = await getBlockDetails(hash)
	const noindex = details === null

	const ogImageUrl = `${env.NEXT_PUBLIC_SITE_URL}${localePath(`/block/${hash}/og-image`, locale)}`

	return {
		title: t('title', { hash: short }),
		description: t('description', { hash: short }),
		robots: noindex ? { index: false, follow: true } : undefined,
		openGraph: {
			title: t('title', { hash: short }),
			description: t('description', { hash: short }),
			url: localePath(`/block/${hash}`, locale),
			type: 'website',
			locale: ogLocale(locale),
			images: [{ url: ogImageUrl, width: 1200, height: 630, alt: short }],
		},
		twitter: {
			card: 'summary_large_image',
			images: [ogImageUrl],
		},
		alternates: {
			canonical: localePath(`/block/${hash}`, locale),
		},
	}
}

export default async function BlockPage({ params }: Props) {
	await connection()

	const { locale, hash } = await params

	// Malformed URL hash: send the visitor to the explorer hub rather than a
	// 404 shell (PPR keeps the shell's status at 200).
	if (!isValidBlockHash(hash)) {
		redirect(localePath('/explore', locale) as Route)
	}
	// Mixed-case hashes would duplicate the URL space; canonicalize.
	const normalized = hash.toLowerCase()
	if (hash !== normalized) {
		redirect(localePath(`/block/${normalized}`, locale) as Route)
	}

	const details = await getBlockDetails(hash)

	// Labels for every account shown on the page (own + counterparties).
	const labelCandidates: string[] = []
	if (details) {
		if (details.blockAccount) labelCandidates.push(details.blockAccount)
		if (details.linkAsAccount) labelCandidates.push(details.linkAsAccount)
		if (details.sourceAccount) labelCandidates.push(details.sourceAccount)
		if (details.representative) labelCandidates.push(details.representative)
	}
	const labels = await getAccountLabels(labelCandidates)

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path={`/block/${hash}`} />
			<ModernPageBackground />

			<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<BlockView hash={hash} locale={locale} details={details} labels={labels} />
			</div>
		</main>
	)
}
