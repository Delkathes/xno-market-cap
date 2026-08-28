import type { Metadata, Route } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'

import { getAccountChainTimes, getAccountData, getAccountHistory } from '@/lib/account-data-service'
import { getAccountLabels } from '@/lib/account-labels'
import {
	COMPARE_COIN_LIMIT,
	COMPARE_COOKIE_NAME,
	DEFAULT_COMPARE_SYMBOLS,
	parseCompareCookie,
} from '@/lib/compare-cookies'
import { getCompareRates, getMarketData } from '@/lib/market-data-service'
import { isValidNanoAddress } from '@/lib/nano-utils'
import { localePath, ogLocale } from '@/lib/seo'

import { env } from '@/env'

import { AccountProfile } from '@/components/account/account-profile'
import { HreflangLinks } from '@/components/hreflang-links'
import { ModernPageBackground } from '@/components/modern-page-background'

type Props = {
	params: Promise<{ locale: string; address: string }>
	searchParams: Promise<{ vs?: string }>
}

// Blocking route: account data must be in the initial HTML (SSR), and the
// page reads cookies/searchParams per request. instant=false is the legal
// flag for that alongside cacheComponents (force-dynamic is not).
export const instant = false

function truncateAddress(address: string): string {
	return `${address.slice(0, 10)}…${address.slice(-6)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	await connection()

	const { locale, address } = await params
	if (!isValidNanoAddress(address)) {
		return {
			title: 'Invalid account address',
			robots: { index: false, follow: false },
		}
	}

	const t = await getTranslations({ locale, namespace: 'metadata.account' })
	const short = truncateAddress(address)

	const result = await getAccountData(address)
	const noindex = !result.ok || !result.data.hasActivity

	const ogImageUrl = `${env.NEXT_PUBLIC_SITE_URL}${localePath(`/account/${address}/og-image`, locale)}`

	return {
		title: t('title', { address: short }),
		description: t('description', { address: short }),
		robots: noindex ? { index: false, follow: true } : undefined,
		openGraph: {
			title: t('title', { address: short }),
			description: t('description', { address: short }),
			url: localePath(`/account/${address}`, locale),
			type: 'website',
			locale: ogLocale(locale),
			images: [{ url: ogImageUrl, width: 1200, height: 630, alt: short }],
		},
		twitter: {
			card: 'summary_large_image',
			images: [ogImageUrl],
		},
		alternates: {
			canonical: localePath(`/account/${address}`, locale),
		},
	}
}

export default async function AccountPage({ params, searchParams }: Props) {
	await connection()

	const { locale, address } = await params
	if (!isValidNanoAddress(address)) {
		// Malformed URL address: send the visitor to the inspector entry
		// rather than a 404 shell (PPR keeps the shell's status at 200).
		redirect(localePath('/tools/account-inspector', locale) as Route)
	}

	const [result, rates, historyPage, cookieStore, market] = await Promise.all([
		getAccountData(address),
		getCompareRates().catch(() => null),
		getAccountHistory(address, 25, 0),
		cookies(),
		getMarketData().catch(() => null),
	])

	const chainTimes = result.ok
		? await getAccountChainTimes(result.data.openBlock, result.data.frontier).catch(() => ({
				openedAt: null,
				lastBlockAt: null,
			}))
		: { openedAt: null, lastBlockAt: null }

	const circulatingSupplyXno = market?.xnoData?.circulating_supply ?? null

	// Labels for every address shown on the page (own + rep + counterparties).
	const labelCandidates = [address]
	if (result.ok && result.data.representative) labelCandidates.push(result.data.representative)
	if (historyPage) {
		for (const entry of historyPage.entries.slice(0, 25)) {
			if (entry.counterparty) labelCandidates.push(entry.counterparty)
		}
	}
	const labels = await getAccountLabels(labelCandidates)

	// Pinned comparison coins: saved cookie wins, defaults when empty, and a
	// one-time ?vs= override on top (never persisted, per the shared-link rule).
	let pinnedSymbols: string[] = []
	let vsOverride = false
	if (rates) {
		const known = new Set(rates.coins.map((coin) => coin.symbol))
		const saved = parseCompareCookie(cookieStore.get(COMPARE_COOKIE_NAME)?.value)
		pinnedSymbols = saved.length > 0 ? saved : DEFAULT_COMPARE_SYMBOLS
		pinnedSymbols = pinnedSymbols.filter((symbol) => known.has(symbol)).slice(0, COMPARE_COIN_LIMIT)

		const { vs } = await searchParams
		const vsSymbol = typeof vs === 'string' ? vs.trim().toUpperCase() : undefined
		if (
			vsSymbol &&
			known.has(vsSymbol) &&
			!pinnedSymbols.includes(vsSymbol) &&
			pinnedSymbols.length < COMPARE_COIN_LIMIT
		) {
			pinnedSymbols = [...pinnedSymbols, vsSymbol]
			vsOverride = true
		}
	}

	const state = result.ok
		? result.data.hasActivity
			? 'ok'
			: 'empty'
		: result.reason === 'notFound'
			? 'notFound'
			: 'rpcError'

	return (
		<main className="relative isolate container mx-auto px-4 py-8">
			<HreflangLinks path={`/account/${address}`} />
			<ModernPageBackground />

			<div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
				<AccountProfile
					address={address}
					locale={locale}
					state={state}
					data={result.ok ? result.data : undefined}
					rates={rates}
					pinnedSymbols={pinnedSymbols}
					vsOverride={vsOverride}
					historyPage={historyPage ?? undefined}
					labels={labels}
					chainTimes={chainTimes}
					circulatingSupplyXno={circulatingSupplyXno}
				/>
			</div>
		</main>
	)
}
