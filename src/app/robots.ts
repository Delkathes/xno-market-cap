import type { MetadataRoute } from 'next'

import { env } from '@/env'

export const revalidate = 86400

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api/'],
			},
		],
		sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
	}
}
