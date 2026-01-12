'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
	ArrowRightLeft,
	ChartPie,
	HelpCircle,
	Menu,
	Moon,
	RefreshCw,
	Scale,
	Sun,
	TrendingUp,
	Wallet,
	X,
	Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Link, usePathname } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { AboutModal } from '@/components/about-modal'
import { DonationButton } from '@/components/donation-button'

const REFRESH_COOLDOWN = 60 // seconds

export function Navigation() {
	const t = useTranslations('navigation')

	const { theme, setTheme, resolvedTheme } = useTheme()

	const pathname = usePathname()

	const [aboutOpen, setAboutOpen] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const queryClient = useQueryClient()

	const [lastRefresh, setLastRefresh] = useState<number>(0)
	const [cooldownRemaining, setCooldownRemaining] = useState(0)

	// Close mobile menu on route change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally close menu on pathname change
	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [mobileMenuOpen])

	useEffect(() => {
		if (cooldownRemaining <= 0) return

		const timer = setInterval(() => {
			const remaining = Math.max(0, REFRESH_COOLDOWN - Math.floor((Date.now() - lastRefresh) / 1000))
			setCooldownRemaining(remaining)
		}, 1000)

		return () => clearInterval(timer)
	}, [lastRefresh, cooldownRemaining])

	const handleRefresh = useCallback(() => {
		if (cooldownRemaining > 0) return

		queryClient.invalidateQueries({ queryKey: ['market-data'] })
		setLastRefresh(Date.now())
		setCooldownRemaining(REFRESH_COOLDOWN)
	}, [queryClient, cooldownRemaining])

	const isRefreshDisabled = cooldownRemaining > 0

	return (
		<header className="border-b border-border bg-card/60 backdrop-blur-lg sticky top-0 z-40">
			<div className="container mx-auto px-4">
				<nav className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2 font-bold text-xl">
							<div className="w-8 h-8 rounded-lg bg-linear-to-b from-cyan-400 to-blue-600 flex items-center justify-center">
								<TrendingUp className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="hidden sm:inline">
								<span className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">
									Nano
								</span>
								<span>MarketCap</span>
							</span>
							<span className="sm:hidden">
								<span className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">
									Nano
								</span>
								<span>MarketCap</span>
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1">
						{/* Donation Button - Desktop only */}
						<DonationButton className="mr-4" />

						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								setTheme(
									theme === 'system'
										? resolvedTheme
											? resolvedTheme === 'dark'
												? 'light'
												: 'dark'
											: 'dark'
										: theme === 'dark'
											? 'light'
											: 'dark',
								)
							}
						>
							<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">{t('toggleTheme')}</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleRefresh}
							disabled={isRefreshDisabled}
							title={
								isRefreshDisabled
									? t('refreshAvailableIn', { seconds: cooldownRemaining })
									: t('refreshMarketData')
							}
						>
							<RefreshCw
								className={cn(
									'h-[1.2rem] w-[1.2rem] transition-all',
									isRefreshDisabled && 'opacity-50',
								)}
							/>
							{isRefreshDisabled && (
								<span className="absolute text-[10px] font-mono font-bold">{cooldownRemaining}</span>
							)}
							<span className="sr-only">{t('refreshMarketData')}</span>
						</Button>

						<Button variant="ghost" size="icon" onClick={() => setAboutOpen(true)} className="mr-2">
							<HelpCircle className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">{t('aboutWebsite')}</span>
						</Button>

						<Link
							href="/calculators"
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors',
								pathname === '/calculators'
									? 'bg-secondary text-secondary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
							)}
						>
							{t('calculators')}
						</Link>

						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuTrigger
										className={cn(
											'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent',
											pathname === '/dominance' ||
												pathname === '/parity' ||
												pathname === '/speculation'
												? 'bg-secondary text-secondary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
										)}
									>
										{t('metrics')}
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="w-fit gap-2 p-4">
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/dominance"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/dominance' &&
																'bg-accent text-accent-foreground',
														)}
													>
														<div className="flex">
															<ChartPie
																className={cn(
																	'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground',
																	pathname === '/dominance' &&
																		'bg-accent text-accent-foreground',
																)}
															/>
															<div className="w-36">
																<div className="text-sm font-medium">
																	{t('dominance')}
																</div>
																<p
																	className={cn(
																		'text-xs text-muted-foreground group-hover:text-accent-foreground',
																		pathname === '/dominance' &&
																			'bg-accent text-accent-foreground',
																	)}
																>
																	{t('dominanceDescription')}
																</p>
															</div>
														</div>
													</Link>
												</NavigationMenuLink>
											</li>
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/parity"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/parity' &&
																'bg-accent text-accent-foreground',
														)}
													>
														<div className="flex">
															<Scale
																className={cn(
																	'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground',
																	pathname === '/parity' &&
																		'bg-accent text-accent-foreground',
																)}
															/>
															<div className="w-36">
																<div className="text-sm font-medium">{t('parity')}</div>
																<p
																	className={cn(
																		'text-xs text-muted-foreground group-hover:text-accent-foreground',
																		pathname === '/parity' &&
																			'bg-accent text-accent-foreground',
																	)}
																>
																	{t('parityDescription')}
																</p>
															</div>
														</div>
													</Link>
												</NavigationMenuLink>
											</li>
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/speculation"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/speculation' &&
																'bg-accent text-accent-foreground',
														)}
													>
														<div className="flex">
															<Zap
																className={cn(
																	'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground',
																	pathname === '/speculation' &&
																		'bg-accent text-accent-foreground',
																)}
															/>
															<div className="w-36">
																<div className="text-sm font-medium">
																	{t('speculation')}
																</div>
																<p
																	className={cn(
																		'text-xs text-muted-foreground group-hover:text-accent-foreground',
																		pathname === '/speculation' &&
																			'bg-accent text-accent-foreground',
																	)}
																>
																	{t('speculationDescription')}
																</p>
															</div>
														</div>
													</Link>
												</NavigationMenuLink>
											</li>
										</ul>
									</NavigationMenuContent>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuTrigger
										className={cn(
											'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent',
											pathname.startsWith('/swap-nano') || pathname.startsWith('/get-nano')
												? 'bg-secondary text-secondary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
										)}
									>
										{t('nano')}
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="w-fit gap-2 p-4">
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/get-nano"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/get-nano' &&
																'bg-accent text-accent-foreground',
														)}
													>
														<div className="flex">
															<Wallet
																className={cn(
																	'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground',
																	pathname === '/get-nano' &&
																		'bg-accent text-accent-foreground',
																)}
															/>
															<div className="w-36">
																<div className="text-sm font-medium">
																	{t('getNano')}
																</div>
																<p
																	className={cn(
																		'text-xs text-muted-foreground group-hover:text-accent-foreground',
																		pathname === '/get-nano' &&
																			'bg-accent text-accent-foreground',
																	)}
																>
																	{t('getNanoDescription')}
																</p>
															</div>
														</div>
													</Link>
												</NavigationMenuLink>
											</li>
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/swap-nano"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/swap-nano' &&
																'bg-accent text-accent-foreground',
														)}
													>
														<div className="flex">
															<ArrowRightLeft
																className={cn(
																	'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground',
																	pathname === '/swap-nano' &&
																		'bg-accent text-accent-foreground',
																)}
															/>
															<div className="w-36">
																<div className="text-sm font-medium">
																	{t('swapToNano')}
																</div>
																<p
																	className={cn(
																		'text-xs text-muted-foreground group-hover:text-accent-foreground',
																		pathname === '/swap-nano' &&
																			'bg-accent text-accent-foreground',
																	)}
																>
																	{t('swapToNanoDescription')}
																</p>
															</div>
														</div>
													</Link>
												</NavigationMenuLink>
											</li>
										</ul>
									</NavigationMenuContent>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					{/* Mobile Controls */}
					<div className="flex md:hidden items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">{t('toggleTheme')}</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleRefresh}
							disabled={isRefreshDisabled}
							title={
								isRefreshDisabled
									? t('refreshAvailableIn', { seconds: cooldownRemaining })
									: t('refreshMarketData')
							}
						>
							<RefreshCw
								className={cn(
									'h-[1.2rem] w-[1.2rem] transition-all',
									isRefreshDisabled && 'opacity-50',
								)}
							/>
							{isRefreshDisabled && (
								<span className="absolute text-[10px] font-mono font-bold">{cooldownRemaining}</span>
							)}
							<span className="sr-only">{t('refreshMarketData')}</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label={t('toggleMenu')}
						>
							{mobileMenuOpen ? (
								<X className="h-[1.2rem] w-[1.2rem]" />
							) : (
								<Menu className="h-[1.2rem] w-[1.2rem]" />
							)}
						</Button>
					</div>
				</nav>
			</div>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<button
					type="button"
					className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-200 cursor-default"
					onClick={() => setMobileMenuOpen(false)}
					aria-label={t('closeMenu')}
				/>
			)}

			{/* Mobile Menu Panel */}
			<div
				className={cn(
					'fixed top-0 right-0 z-50 h-full w-72 max-w-[80vw] bg-card border-l border-border shadow-lg md:hidden transition-transform duration-200 ease-in-out',
					mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
				)}
			>
				<div className="flex flex-col h-full">
					{/* Mobile Menu Header */}
					<div className="flex items-center justify-between h-16 px-4 border-b border-border">
						<span className="font-semibold">{t('menu')}</span>
						<Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
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
								href="/calculators"
								className={cn(
									'px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/calculators'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								{t('calculators')}
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

							<div className="my-2 border-t border-border" />

							<div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t('nano')}
							</div>

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
									setAboutOpen(true)
									setMobileMenuOpen(false)
								}}
							>
								<HelpCircle className="h-4 w-4 mr-3" />
								{t('aboutWebsite')}
							</Button>
						</div>
					</div>

					{/* Mobile Menu Footer - Donation */}
					<DonationButton className="mx-auto mb-4 translate-y-0" />
				</div>
			</div>

			<AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
		</header>
	)
}
