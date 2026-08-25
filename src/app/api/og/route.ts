import { getAllNews } from '@/lib/news'

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

// Simple word wrap: mono-ish metrics, ~24 chars per line at 44px
function wrapTitle(title: string, maxChars = 26): string[] {
	const words = title.split(/\s+/)
	const lines: string[] = []
	let line = ''
	for (const word of words) {
		if (`${line} ${word}`.trim().length > maxChars) {
			if (line) lines.push(line)
			line = word
		} else {
			line = `${line} ${word}`.trim()
		}
	}
	if (line) lines.push(line)
	return lines.slice(0, 4)
}

function buildOgSvg(title: string, emoji: string, date: string, author: string | undefined): string {
	const lines = wrapTitle(title)
	const lineHeight = 62
	const startY = 300 - ((lines.length - 1) * lineHeight) / 2

	const textLines = lines
		.map(
			(line, i) =>
				`<text x="72" y="${startY + i * lineHeight}" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="#F8FAFC">${escapeXml(line)}</text>`,
		)
		.join('')

	const metaParts = [author ?? 'NanoMarketCap', date].join('   ·   ')

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d2b45"/>
      <stop offset="0.5" stop-color="#0a1f35"/>
      <stop offset="1" stop-color="#134e6f"/>
    </linearGradient>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <text x="1080" y="590" font-family="system-ui, sans-serif" font-size="220" font-weight="700" fill="#FFFFFF" fill-opacity="0.05">Ӿ</text>
  <rect x="72" y="72" width="128" height="128" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.15"/>
  <text x="136" y="162" font-size="72" text-anchor="middle">${escapeXml(emoji)}</text>
  <text x="248" y="112" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="22" letter-spacing="4" fill="#7DD3FC" fill-opacity="0.85">${escapeXml(metaParts)}</text>
  ${textLines}
  <text x="72" y="548" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26" letter-spacing="3" fill="#209CE9">NANOMARKETCAP.COM</text>
</svg>`
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug')
	if (!slug) {
		return new Response('Missing slug', { status: 400 })
	}

	const articles = await getAllNews()
	const article = articles.find((a) => a.slug === slug)
	if (!article) {
		return new Response('Not found', { status: 404 })
	}

	const svg = buildOgSvg(article.title, article.emoji ?? '📰', article.date, article.author)

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
		},
	})
}
