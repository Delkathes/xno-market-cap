import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'

import { Navigation } from '@/components/navigation'
import { Providers } from '@/components/providers'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nanomarketcap.com'

export const metadata: Metadata = {
	metadataBase: new URL(APP_URL),
	title: {
		default: 'NanoMarketCap – XNO Price, Market Cap & Dominance Tracker',
		template: '%s | NanoMarketCap',
	},
	description:
		'Track Nano (XNO) price, market cap, and dominance. Compare XNO against top cryptocurrencies, analyze scarcity parity, and swap to Nano instantly.',
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
		locale: 'en_US',
		url: APP_URL,
		siteName: 'NanoMarketCap',
		title: 'NanoMarketCap – XNO Price, Market Cap & Dominance Tracker',
		description:
			'Track Nano (XNO) price, market cap, and dominance. Compare XNO against top cryptocurrencies, analyze scarcity parity, and swap to Nano instantly.',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'NanoMarketCap – Track XNO Price and Market Data',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'NanoMarketCap – XNO Price, Market Cap & Dominance Tracker',
		description:
			'Track Nano (XNO) price, market cap, and dominance. Compare XNO against top cryptocurrencies and swap to Nano instantly.',
		images: ['/og-image.png'],
	},
	alternates: {
		canonical: APP_URL,
	},
	category: 'finance',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`font-sans antialiased`}>
				<Providers>
					<div className="min-h-screen bg-background">
						<Navigation />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	)
}
