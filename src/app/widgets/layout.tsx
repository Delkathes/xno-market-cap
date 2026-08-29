import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { EmbedAutoHeight } from '@/components/widgets/embed-auto-height'

import '../[locale]/globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

// Bare layout for embeddable widgets: html/body, fonts, theme and NOTHING
// else — no site chrome, no next-intl (widgets are prop-driven), no analytics.
export default function WidgetsLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
				<ThemeProvider defaultTheme="system" disableTransitionOnChange>
					{children}
					<EmbedAutoHeight />
				</ThemeProvider>
			</body>
		</html>
	)
}
