import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'

import { Link } from '@/i18n/navigation'

import { localePath } from '@/lib/seo'
import { breadcrumbNode, SITE, webPageNode, websiteNode } from '@/lib/structured-data'

import { HreflangLinks } from '@/components/hreflang-links'

type Props = {
	params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	'use cache'
	cacheLife('max')

	const { locale } = await params

	return {
		title: { absolute: 'Editorial Policy — NanoMarketCap' },
		description: 'How NanoMarketCap sources, updates, corrects, and reviews the articles it publishes.',
		alternates: { canonical: localePath('/editorial-policy', locale) },
	}
}

export default async function EditorialPolicyPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const url = `${SITE}${localePath('/editorial-policy', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/editorial-policy" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							websiteNode(),
							webPageNode({ url, name: 'Editorial Policy — NanoMarketCap', locale }),
							breadcrumbNode(url, [
								{ name: 'Home', url: `${SITE}${localePath('/', locale)}` },
								{ name: 'Editorial policy' },
							]),
						],
					}),
				}}
			/>

			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Editorial policy</h1>
			<div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground">
				<section>
					<h2 className="text-xl font-semibold text-foreground">Sourcing</h2>
					<p className="mt-2">
						Articles link to primary sources where a claim depends on a protocol specification, a release
						note, a repository, or an on-chain transaction. Market data comes from CoinGecko. Numbers in
						articles are dated so readers can tell when a snapshot was taken.
					</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">Corrections and updates</h2>
					<p className="mt-2">
						When a material fact changes, the article is updated and the modified date is shown in the
						article metadata. Corrections can be raised through the{' '}
						<Link href="/contact" className="text-primary underline underline-offset-4">
							contact page
						</Link>
						. Minor copy edits do not change the publication date.
					</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">Independence</h2>
					<p className="mt-2">
						NanoMarketCap is an independent market-data and news project. Articles are informational and are
						not investment advice. Sponsored placements, when present, are labelled and kept separate from
						editorial content.
					</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">Research and translation</h2>
					<p className="mt-2">
						The team may use research and translation tools to support the editorial process. Published
						articles are reviewed by the team before release, and the byline reflects who is accountable for
						the piece.
					</p>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-foreground">Contact</h2>
					<p className="mt-2">
						Questions about this policy can be raised through the{' '}
						<Link href="/contact" className="text-primary underline underline-offset-4">
							contact page
						</Link>
						.
					</p>
				</section>
			</div>
		</main>
	)
}
