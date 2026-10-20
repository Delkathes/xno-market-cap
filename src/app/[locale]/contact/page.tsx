import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'

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
		title: { absolute: 'Contact NanoMarketCap' },
		description: 'Report a correction, flag a data issue, or ask about partnerships and press.',
		alternates: { canonical: localePath('/contact', locale) },
	}
}

export default async function ContactPage({ params }: Props) {
	'use cache'
	cacheLife('max')

	const { locale } = await params
	const url = `${SITE}${localePath('/contact', locale)}`

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<HreflangLinks path="/contact" />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							websiteNode(),
							webPageNode({ url, name: 'Contact NanoMarketCap', locale }),
							breadcrumbNode(url, [
								{ name: 'Home', url: `${SITE}${localePath('/', locale)}` },
								{ name: 'Contact' },
							]),
						],
					}),
				}}
			/>

			<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact</h1>
			<div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
				<p>
					For corrections, data problems, broken links, or partnership and press questions, open an issue in
					the public repository. Include the page URL and the value you expected to see.
				</p>
				<p>
					<a
						href="https://github.com/Delkathes/xno-market-cap/issues"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-primary underline underline-offset-4"
					>
						Open an issue on GitHub
					</a>
				</p>
				<p>
					NanoMarketCap does not provide investment advice, custody, or trade execution. Do not send private
					keys, seed phrases, or wallet credentials through any channel.
				</p>
			</div>
		</main>
	)
}
