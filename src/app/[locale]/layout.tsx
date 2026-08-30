import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getTranslations } from 'next-intl/server'

import { type Locale, routing } from '@/i18n/routing'

import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { ogLocale } from '@/lib/seo'

import { env } from '@/env'

import { AnnouncementBanner } from '@/components/announcement-banner'
import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

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
					url: '/X_abstract.svg',
					type: 'image/svg+xml',
				},
			],
			apple: '/apple-icon.png',
		},
		openGraph: {
			type: 'website',
			locale: ogLocale(locale),
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
			languages: Object.fromEntries(
				LOCALES.map((locale) => [locale, locale === DEFAULT_LOCALE ? SITE_URL : `${SITE_URL}/${locale}`]),
			),
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

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
				<ThemeProvider defaultTheme="system" disableTransitionOnChange>
					<Providers>
						<div className="min-h-screen flex flex-col animate-gradient-shift">
							{/* Navigation uses usePathname (URL data) — wrap in Suspense so it
							    streams in after prerendering instead of blocking it */}
							<Suspense fallback={<NavigationFallback />}>
								<Navigation />
							</Suspense>
							<AnnouncementBanner />
							<div className="flex-1 z-0 flex flex-col relative">{children}</div>
							<Footer locale={locale} />
						</div>
						<Analytics />
						<SpeedInsights />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	)
}

function NavigationFallback() {
	return <div className="h-16 border-b border-border bg-card/60 backdrop-blur-lg" />
}
