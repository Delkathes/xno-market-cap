'use client'

import { useEffect } from 'react'
import { atom, useAtom, useSetAtom } from 'jotai'
import {
	ArrowRightLeft,
	Blocks,
	Calculator,
	ChartPie,
	Compass,
	Fingerprint,
	Flag,
	HelpCircle,
	Lightbulb,
	Link2,
	Network,
	Newspaper,
	Scale,
	ScanSearch,
	Wallet,
	X,
	Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
// import { DonationButton } from '@/components/donation-button'
import { isAboutOpenAtom } from '@/components/navigation'

export const isMobileMenuOpenAtom = atom(false)

export function MobileMenuPanel() {
	const t = useTranslations('navigation')

	const pathname = usePathname()

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(isMobileMenuOpenAtom)
	const setIsAboutOpen = useSetAtom(isAboutOpenAtom)

	// Close mobile menu on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally close menu on pathname change
	useEffect(() => {
		setIsMobileMenuOpen(false)
	}, [pathname, setIsMobileMenuOpen])

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isMobileMenuOpen])

	return (
		<>
			{/* Overlay */}
			{isMobileMenuOpen && (
				<button
					type="button"
					className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-200 cursor-default"
					onClick={() => setIsMobileMenuOpen(false)}
					aria-label={t('closeMenu')}
				/>
			)}

			{/* Panel */}
			<div
				className={cn(
					'fixed top-0 right-0 z-50 h-full w-72 max-w-[80vw] bg-card border-l border-border shadow-lg md:hidden transition-transform duration-200 ease-in-out',
					isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
				)}
			>
				<div className="flex flex-col h-full">
					{/* Mobile Menu Header */}
					<div className="flex items-center justify-between h-16 px-4 border-b border-border">
						<span className="font-semibold">{t('menu')}</span>
						<Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
							<X className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">{t('closeMenu')}</span>
						</Button>
					</div>

					{/* Mobile Menu Links */}
					<div className="flex-1 overflow-y-auto py-4">
						<div className="flex flex-col gap-1 px-2">
							<Link
								href="/"
								className={cn(
									'px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								{t('home')}
							</Link>
							<Link
								href="/news"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/news' || pathname.startsWith('/news/')
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Newspaper className="h-4 w-4 text-primary" />
								{t('news')}
							</Link>
							<Link
								href="/widgets"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/widgets' || pathname.startsWith('/widgets/')
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Blocks className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolWidgets')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolWidgetsDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/explore"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/explore' ||
										pathname.startsWith('/account') ||
										pathname.startsWith('/block')
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Compass className="h-4 w-4 text-primary" />
								<div>
									<div>{t('explorer')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('explorerDescription')}
									</p>
								</div>
							</Link>

							<div className="my-2 border-t border-border" />

							<div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t('metrics')}
							</div>

							<Link
								href="/dominance"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/dominance'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<ChartPie className="h-4 w-4 text-primary" />
								<div>
									<div>{t('dominance')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('dominanceDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/parity"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/parity'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Scale className="h-4 w-4 text-primary" />
								<div>
									<div>{t('parity')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('parityDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/speculation"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/speculation'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Zap className="h-4 w-4 text-primary" />
								<div>
									<div>{t('speculation')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('speculationDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/milestones"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/milestones'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Flag className="h-4 w-4 text-primary" />
								<div>
									<div>{t('milestones')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('milestonesDescription')}
									</p>
								</div>
							</Link>

							<Link
								href="/decentralization"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/decentralization'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Network className="h-4 w-4 text-primary" />
								<div>
									<div>{t('decentralization')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('decentralizationDescription')}
									</p>
								</div>
							</Link>

							<div className="my-2 border-t border-border" />

							<div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t('tools')}
							</div>

							<Link
								href="/calculators"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/calculators'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Calculator className="h-4 w-4 text-primary" />
								<div>
									<div>{t('calculators')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('calculatorsDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/tools/unit-converter"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/tools/unit-converter'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<ArrowRightLeft className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolUnitConverter')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolUnitConverterDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/tools/payment-links"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/tools/payment-links'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Link2 className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolPaymentLinks')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolPaymentLinksDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/tools/address-tools"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/tools/address-tools'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Fingerprint className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolAddressTools')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolAddressToolsDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/tools/account-inspector"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/tools/account-inspector'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<ScanSearch className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolAccountInspector')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolAccountInspectorDescription')}
									</p>
								</div>
							</Link>
							<Link
								href="/tools/fee-comparison"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/tools/fee-comparison'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Zap className="h-4 w-4 text-primary" />
								<div>
									<div>{t('toolFeeComparison')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('toolFeeComparisonDescription')}
									</p>
								</div>
							</Link>

							<div className="my-2 border-t border-border" />

							<div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t('nano')}
							</div>

							<Link
								href="/why-nano"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/why-nano'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Lightbulb className="h-4 w-4 text-primary" />
								<div>
									<div>{t('whyNano')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('whyNanoDescriptionShort')}
									</p>
								</div>
							</Link>

							<Link
								href="/get-nano"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/get-nano'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<Wallet className="h-4 w-4 text-primary" />
								<div>
									<div>{t('getNano')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('getNanoDescriptionShort')}
									</p>
								</div>
							</Link>

							<Link
								href="/swap-nano"
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/swap-nano'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								<ArrowRightLeft className="h-4 w-4 text-primary" />
								<div>
									<div>{t('swapToNano')}</div>
									<p className="text-xs text-muted-foreground font-normal">
										{t('swapToNanoDescriptionShort')}
									</p>
								</div>
							</Link>

							<div className="my-2 border-t border-border" />

							<Button
								variant="ghost"
								className="justify-start px-4 py-3 h-auto"
								onClick={() => {
									setIsAboutOpen(true)
									setIsMobileMenuOpen(false)
								}}
							>
								<HelpCircle className="h-4 w-4 mr-3" />
								{t('aboutWebsite')}
							</Button>
						</div>
					</div>

					{/* Mobile Menu Footer - Donation */}
					{/* <DonationButton className="mx-auto mb-4 translate-y-0" /> */}
				</div>
			</div>
		</>
	)
}
