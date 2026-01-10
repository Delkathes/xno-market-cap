import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import { env } from '@/env'

import { Navigation } from '@/components/navigation'
import { Providers } from '@/components/providers'

import { type Locale, routing } from '@/i18n/routing'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'metadata' })

	return {
		metadataBase: new URL(SITE_URL),
		title: {
			default: t('title'),
			template: '%s | NanoMarketCap',
		},
		description: t('description'),
		keywords: [
			'Nano',
			'XNO',
			'cryptocurrency',
			'market cap',
			'crypto tracker',
			'Nano price',
			'XNO price',
			'market dominance',
			'scarcity parity',
			'swap Nano',
			'buy Nano',
			'Nanswap',
		],
		authors: [{ name: 'NanoMarketCap' }],
		creator: 'NanoMarketCap',
		publisher: 'NanoMarketCap',
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		icons: {
			icon: [
				{
					url: '/icon-light-32x32.png',
					media: '(prefers-color-scheme: light)',
				},
				{
					url: '/icon-dark-32x32.png',
					media: '(prefers-color-scheme: dark)',
				},
				{
					url: '/icon.svg',
					type: 'image/svg+xml',
				},
			],
			apple: '/apple-icon.png',
		},
		openGraph: {
			type: 'website',
			locale: locale === 'fr' ? 'fr_FR' : 'en_US',
			url: SITE_URL,
			siteName: 'NanoMarketCap',
			title: t('ogTitle'),
			description: t('ogDescription'),
			images: [
				{
					url: '/og-image.png',
					width: 1200,
					height: 630,
					alt: t('ogImageAlt'),
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: t('twitterTitle'),
			description: t('twitterDescription'),
			images: ['/og-image.png'],
		},
		alternates: {
			canonical: SITE_URL,
			languages: {
				en: `${SITE_URL}/en`,
				fr: `${SITE_URL}/fr`,
			},
		},
		category: 'finance',
	}
}

export default async function RootLayout({ children, params }: Props) {
	const { locale } = await params

	// Validate locale
	if (!routing.locales.includes(locale as Locale)) {
		notFound()
	}

	// Enable static rendering
	setRequestLocale(locale)

	// Get messages for client components
	const messages = await getMessages()

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`font-sans antialiased`} suppressHydrationWarning>
				<NextIntlClientProvider messages={messages}>
					<Providers>
						<div className="min-h-screen bg-linear-to-br from-cyan-50 to-blue-100/60 dark:from-blue-950 dark:to-cyan-950">
							<Navigation />
							{children}
						</div>
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
