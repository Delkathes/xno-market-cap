import { ImageResponse } from 'next/og'
import { createElement as h } from 'react'

import { getAllNews } from '@/lib/news'

const WIDTH = 1200
const HEIGHT = 630

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug')
	if (!slug) {
		return new Response('Missing slug', { status: 400 })
	}

	const articles = await getAllNews()
	const article = articles.find((item) => item.slug === slug)
	if (!article) {
		return new Response('Not found', { status: 404 })
	}

	const titleSize = article.title.length > 70 ? 46 : article.title.length > 48 ? 54 : 62

	return new ImageResponse(
		h(
			'div',
			{
				style: {
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					width: '100%',
					height: '100%',
					background: 'linear-gradient(135deg, #0d2b45 0%, #0a1f35 55%, #134e6f 100%)',
					padding: 72,
					color: '#F8FAFC',
				},
			},
			h(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						gap: 20,
						fontSize: 24,
						letterSpacing: 4,
						textTransform: 'uppercase',
						color: '#7DD3FC',
					},
				},
				h(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 72,
							height: 72,
							borderRadius: 16,
							border: '1px solid rgba(255,255,255,0.18)',
							background: 'rgba(255,255,255,0.06)',
							fontSize: 24,
							fontWeight: 700,
							color: '#FFFFFF',
						},
					},
					'XNO',
				),
				h('div', { style: { display: 'flex' } }, article.author ?? 'NanoMarketCap'),
				h('div', { style: { display: 'flex', opacity: 0.6 } }, '·'),
				h('div', { style: { display: 'flex' } }, article.date),
			),
			h(
				'div',
				{
					style: {
						display: 'flex',
						fontSize: titleSize,
						fontWeight: 700,
						lineHeight: 1.12,
						letterSpacing: -1,
						maxWidth: 1000,
					},
				},
				article.title,
			),
			h(
				'div',
				{
					style: {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						borderTop: '1px solid rgba(255,255,255,0.15)',
						paddingTop: 24,
						fontSize: 24,
						letterSpacing: 3,
						color: '#209CE9',
					},
				},
				h('div', { style: { display: 'flex' } }, 'NANOMARKETCAP.COM'),
				h('div', { style: { display: 'flex', color: 'rgba(255,255,255,0.55)' } }, 'NANO (XNO) NEWS'),
			),
		),
		{
			width: WIDTH,
			height: HEIGHT,
			headers: {
				'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
			},
		},
	)
}
