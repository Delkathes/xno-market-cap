import type { MetadataRoute } from 'next'

import { env } from '@/env'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: [
					'OAI-SearchBot',
					'PerplexityBot',
					'Claude-SearchBot',
					'GPTBot',
					'ClaudeBot',
					'Google-Extended',
				],
				allow: '/',
			},
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api/'],
			},
			{
				userAgent: 'GoogleOther',
				disallow: '/',
			},
		],
		sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
	}
}
