import { env } from '@/env'

const SITE = env.NEXT_PUBLIC_SITE_URL

export async function GET() {
	const body = `# NanoMarketCap

> Independent Nano (XNO) market data, on-chain analytics, and ecosystem news. Live prices, market cap, dominance, and XNO-denominated comparisons for the top 100 cryptocurrencies.

Canonical: ${SITE}
Languages: en, nl, es, it, de, fr

## Core pages

- [Nano market cap and price](${SITE}/): Live XNO price, market cap, 24h volume, dominance, and the market ledger valued in XNO.
- [Nano price chart](${SITE}/coin/nano): XNO price chart, market cap, volume, supply, and fully diluted valuation.
- [Nano news](${SITE}/news): Ecosystem news, development updates, and market analysis.
- [Nano dominance](${SITE}/dominance): XNO dominance against BTC, ETH, and the rest of the top 100.
- [Scarcity parity](${SITE}/parity): Compare XNO market cap with other assets.
- [Speculation table](${SITE}/speculation): XNO price scenarios at different market caps.
- [Tools](${SITE}/tools/unit-converter): Unit converter, payment links, address tools, account inspector, and fee comparison.
- [Why Nano](${SITE}/why-nano): Why XNO fits machine payments and the x402 protocol.
- [About](${SITE}/about): Operator, data sources, and methodology.
- [Editorial policy](${SITE}/editorial-policy): Sourcing, corrections, and AI-use policy.

## API

- [Market data](${SITE}/api/market-data): JSON snapshot of the top 100 assets and XNO market data.
- [Price chart](${SITE}/api/price-chart/nano/30/usd): Historical XNO price series.
- [Donation balance](${SITE}/api/donation-balance): Treasury donation address and balance.
- [OpenAPI](${SITE}/api/openapi.json): Machine-readable API description.

## Feeds

- [Sitemap](${SITE}/sitemap.xml)
- [RSS](${SITE}/rss.xml)

## Reuse

Market data is sourced from CoinGecko and used under its terms. Quote the site with a link to the canonical page. Do not present the data as investment advice.
`

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
		},
	})
}
