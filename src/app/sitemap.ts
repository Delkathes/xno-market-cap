import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nanomarketcap.com'

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	return [
		{
			url: APP_URL,
			lastModified,
			changeFrequency: 'hourly',
			priority: 1,
		},
		{
			url: `${APP_URL}/dominance`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.9,
		},
		{
			url: `${APP_URL}/parity`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.9,
		},
		{
			url: `${APP_URL}/speculation`,
			lastModified,
			changeFrequency: 'hourly',
			priority: 0.8,
		},
		{
			url: `${APP_URL}/get-nano`,
			lastModified,
			changeFrequency: 'monthly',
			priority: 0.7,
		},
		{
			url: `${APP_URL}/swap-nano`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
	]
}
