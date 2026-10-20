import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'

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
		title: { absolute: 'Authors — NanoMarketCap' },
		description: 'The NanoMarketCap editorial team and how bylines work.',
		alternates: { canonical: localePath('/authors', locale) },
	}
}

export default async function AuthorsPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const url = `${SITE}${localePath('/authors', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/authors" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							organizationNode(),
							websiteNode(),
							webPageNode({ url, name: 'Authors — NanoMarketCap', locale }),
							breadcrumbNode(url, [
								{ name: 'Home', url: `${SITE}${localePath('/', locale)}` },
								{ name: 'Authors' },
							]),
						],
					}),
				}}
			/>

			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Authors</h1>
			<section className="mt-8 rounded-md border bg-card p-6">
				<h2 className="text-xl font-semibold">NanoMarketCap Team</h2>
				<p className="mt-2 text-sm leading-7 text-muted-foreground">
					The NanoMarketCap Team writes and edits the news, development updates, and market analysis published
					on this site. The team byline is used for collaborative work; individual authors are credited when a
					piece is written by one person.
				</p>
				<p className="mt-3 text-sm leading-7 text-muted-foreground">
					Sourcing, corrections, and update practices are described in the{' '}
					<Link href="/editorial-policy" className="text-primary underline underline-offset-4">
						editorial policy
					</Link>
					.
				</p>
			</section>
		</main>
	)
}
