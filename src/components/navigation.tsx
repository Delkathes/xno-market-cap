'use client'

import { atom, useAtom } from 'jotai'

import { Link } from '@/i18n/navigation'

import { AboutModal } from '@/components/about-modal'
import { DesktopControls } from '@/components/desktop-controls'
import { MobileControls } from '@/components/mobile-controls'
import { MobileMenuPanel } from '@/components/mobile-menu-panel'
import { XAbstractIcon } from '@/components/x-abstract-icon'

export const isAboutOpenAtom = atom(false)

export function Navigation() {
	const [isAboutOpen, setIsAboutOpen] = useAtom(isAboutOpenAtom)

	return (
		<header className="border-b border-border sticky top-0 z-50">
			<div className="bg-card/60 backdrop-blur-lg">
				<nav className="container mx-auto px-4 flex items-center justify-between h-16">
					<LayoutLogo />

					<DesktopControls />

					<MobileControls />
				</nav>
			</div>

			<MobileMenuPanel />

			<AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
		</header>
	)
}

function LayoutLogo() {
	return (
		<div className="flex items-center gap-4">
			<Link href="/" className="flex items-center gap-2 font-bold text-xl">
				<XAbstractIcon className="size-10" title="NanoMarketCap" />
				<span className="hidden sm:inline">
					<span className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">Nano</span>
					<span>MarketCap</span>
				</span>
				<span className="sm:hidden">
					<span className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">Nano</span>
					<span>MarketCap</span>
				</span>
			</Link>
		</div>
	)
}
