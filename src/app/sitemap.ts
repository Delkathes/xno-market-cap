import type { MetadataRoute } from 'next'

import { env } from '@/env'

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	return [
		{
			url: SITE_URL,
			lastModified,
			changeFrequency: 'hourly',
			priority: 1,
		},
		{
			url: `${SITE_URL}/dominance`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/parity`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/speculation`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/get-nano`,
			lastModified,
			changeFrequency: 'monthly',
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/swap-nano`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
	]
}
