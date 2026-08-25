import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

/**
 * Root layout: lives above the [locale] segment so client components here
 * (notably next-themes, which renders an inline <script>) are never remounted
 * during locale-switch navigations.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
				{/* Set the <html lang> attribute from the URL since the root layout
				    cannot read the [locale] param. Runs once, before paint. */}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static inline lang setter with fixed content
					dangerouslySetInnerHTML={{
						__html: `(function(){var m=location.pathname.match(/^\\/([a-z]{2})(?:\\/|$)/);document.documentElement.lang=m?m[1]:'en';})()`,
					}}
				/>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
