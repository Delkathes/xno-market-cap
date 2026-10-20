import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { localePath } from '@/lib/seo'
import { breadcrumbNode, organizationNode, SITE, webPageNode, websiteNode } from '@/lib/structured-data'

import { HreflangLinks } from '@/components/hreflang-links'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params

	return {
		title: { absolute: 'About NanoMarketCap' },
		description:
			'Who runs NanoMarketCap, where the market data comes from, how the XNO-denominated ledger works, and how to contact the project.',
		alternates: { canonical: localePath('/about', locale) },
	}
}

export default async function AboutPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const tn = await getTranslations({ locale, namespace: 'news' })
	const url = `${SITE}${localePath('/about', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/about" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							organizationNode(),
							websiteNode(),
							webPageNode({ url, name: 'About NanoMarketCap', locale }),
							breadcrumbNode(url, [
								{ name: 'Home', url: `${SITE}${localePath('/', locale)}` },
								{ name: 'About' },
							]),
						],
					}),
				}}
			/>

			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">About NanoMarketCap</h1>
			<div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
				<p>
					<strong className="text-foreground">NanoMarketCap</strong> is a cryptocurrency market cap tracker
					that puts Nano (XNO) at the center of everything. Unlike trackers that use fiat as a base currency,
					it values prices, market caps, and dominance relative to XNO.
				</p>
				<p>
					The market ledger values the top 100 cryptocurrencies in XNO rather than in US dollars. That
					inversion makes Nano&apos;s share of the market, its dominance, and its scarcity relative to other
					assets directly readable. Prices and market statistics come from the CoinGecko API and are refreshed
					continuously.
				</p>
				<p>
					NanoMarketCap is an independent market-data project. It is not investment advice, and it does not
					custody funds or execute trades. See the{' '}
					<Link href="/legal/disclaimer" className="text-primary underline underline-offset-4">
						disclaimer
					</Link>{' '}
					for the full terms.
				</p>
			</div>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">Methodology</h2>
				<ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
					<li>Market prices, market caps, supply, and volume come from CoinGecko.</li>
					<li>
						The market ledger converts each asset&apos;s USD market cap into XNO using the live XNO price.
					</li>
					<li>Dominance is calculated over the fetched top-100 set, not the entire crypto market.</li>
					<li>Market cap is calculated as circulating supply multiplied by the current price.</li>
					<li>Nano has no mining and no inflation; the full supply was distributed at launch.</li>
					<li>Charts and tables are cached briefly and refresh automatically in the browser.</li>
				</ul>
			</section>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">{tn('title')}</h2>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">{tn('intro')}</p>
			</section>

			<section className="mt-10 border-t border-border pt-8">
				<h2 className="text-xl font-semibold">Editorial and contact</h2>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">
					News and analysis follow the{' '}
					<Link href="/editorial-policy" className="text-primary underline underline-offset-4">
						editorial policy
					</Link>
					. Corrections, data issues, and partnership questions can be raised through the{' '}
					<Link href="/contact" className="text-primary underline underline-offset-4">
						contact page
					</Link>
					.
				</p>
			</section>
		</main>
	)
}
