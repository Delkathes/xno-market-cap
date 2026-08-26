import { getAllNews, getNewsBodyPlain } from '@/lib/news'

import { env } from '@/env'

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

const MAX_DESCRIPTION_LENGTH = 600

// Global feed in the default locale; the middleware matcher skips dotted
// paths, so this lives outside the [locale] group.
export async function GET(): Promise<Response> {
	const siteUrl = env.NEXT_PUBLIC_SITE_URL
	const feedUrl = `${siteUrl}/rss.xml`
	const articles = await getAllNews()

	const items = articles
		.map((article) => {
			const body = getNewsBodyPlain(article.slug)
			const description =
				body.length > MAX_DESCRIPTION_LENGTH ? `${body.slice(0, MAX_DESCRIPTION_LENGTH)}...` : body
			const pubDate = new Date(`${article.date}T00:00:00Z`).toUTCString()

			return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(`${siteUrl}/news/${article.slug}`)}</link>
      <guid isPermaLink="false">${escapeXml(article.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
		})
		.join('\n')

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NanoMarketCap News</title>
    <link>${escapeXml(`${siteUrl}/news`)}</link>
    <description>News about Nano (XNO), its ecosystem and market.</description>
    <language>en</language>
    <ttl>60</ttl>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
		},
	})
}
