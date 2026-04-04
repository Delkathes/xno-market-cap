import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { type Locale, routing } from '@/i18n/routing'

import { env } from '@/env'

import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'
import { Providers } from '@/components/providers'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})
const spaceGrotesk = Space_Grotesk({ variable: '--space-grotesk', subsets: ['latin'] })

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
					url: '/X_abstract.svg',
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

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
				suppressHydrationWarning
			>
				<Providers>
					<div className="min-h-screen flex flex-col animate-gradient-shift">
						<Navigation />
						<main className="flex-1 z-0 flex flex-col">{children}</main>
						<Footer locale={locale} />
					</div>
				</Providers>
			</body>
		</html>
	)
}
