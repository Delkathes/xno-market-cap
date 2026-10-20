import { env } from '@/env'

const SITE = env.NEXT_PUBLIC_SITE_URL

export async function GET() {
	return Response.json(
		{
			openapi: '3.1.0',
			info: {
				title: 'NanoMarketCap API',
				version: '1.0.0',
				description: 'Read-only Nano (XNO) market data and on-chain lookups.',
				contact: { url: `${SITE}/contact` },
			},
			servers: [{ url: SITE }],
			paths: {
				'/api/market-data': {
					get: {
						summary: 'Top 100 market snapshot',
						responses: { '200': { description: 'Market data' } },
					},
				},
				'/api/price-chart/{coin}/{days}/{quote}': {
					get: {
						summary: 'Historical price series',
						parameters: [
							{ name: 'coin', in: 'path', required: true, schema: { type: 'string' } },
							{ name: 'days', in: 'path', required: true, schema: { type: 'string' } },
							{ name: 'quote', in: 'path', required: true, schema: { type: 'string' } },
						],
						responses: { '200': { description: 'Price series' } },
					},
				},
				'/api/donation-balance': {
					get: {
						summary: 'Treasury donation balance',
						responses: { '200': { description: 'Address and balance' } },
					},
				},
				'/api/account-info': {
					get: {
						summary: 'Nano account summary',
						parameters: [{ name: 'address', in: 'query', required: true, schema: { type: 'string' } }],
						responses: { '200': { description: 'Account data' } },
					},
				},
				'/api/block-info': {
					get: {
						summary: 'Nano block lookup',
						parameters: [{ name: 'hash', in: 'query', required: true, schema: { type: 'string' } }],
						responses: { '200': { description: 'Block data' } },
					},
				},
			},
		},
		{
			headers: {
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
			},
		},
	)
}
