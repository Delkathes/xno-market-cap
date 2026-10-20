const key = process.env.INDEXNOW_KEY
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nanomarketcap.com').replace(/\/$/, '')

if (!key) {
	console.error('INDEXNOW_KEY is required')
	process.exit(1)
}

const sitemapResponse = await fetch(`${site}/sitemap.xml`)
if (!sitemapResponse.ok) {
	console.error(`Sitemap request failed: HTTP ${sitemapResponse.status}`)
	process.exit(1)
}

const sitemap = await sitemapResponse.text()
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

const response = await fetch('https://api.indexnow.org/indexnow', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		host: new URL(site).host,
		key,
		keyLocation: `${site}/${key}.txt`,
		urlList: urls,
	}),
})

console.log(`INDEXNOW ${response.status} ${urls.length} URLs`)
if (!response.ok) {
	console.error(await response.text())
	process.exit(1)
}
