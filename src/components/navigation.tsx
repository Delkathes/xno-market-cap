'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeft, HelpCircle, Menu, Moon, RefreshCw, Sun, TrendingUp, Wallet, X } from 'lucide-react'
import { useTheme } from 'next-themes'

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
	const pathname = usePathname()
	const { theme, setTheme } = useTheme()
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
		<header className="border-b border-border bg-card">
			<div className="container mx-auto px-4">
				<nav className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2 font-bold text-xl">
							<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
								<TrendingUp className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="hidden sm:inline">{'NanoMarketCap'}</span>
							<span className="sm:hidden">{'NanoMarketCap'}</span>
						</Link>
					</div>

					{/* Donation Button - Desktop only */}
					<div className="hidden lg:flex items-center">
						<DonationButton />
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">Toggle theme</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleRefresh}
							disabled={isRefreshDisabled}
							title={
								isRefreshDisabled ? `Refresh available in ${cooldownRemaining}s` : 'Refresh market data'
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
							<span className="sr-only">Refresh market data</span>
						</Button>

						<Button variant="ghost" size="icon" onClick={() => setAboutOpen(true)} className="mr-2">
							<HelpCircle className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">About this website</span>
						</Button>

						<Link
							href="/dominance"
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors',
								pathname === '/dominance'
									? 'bg-secondary text-secondary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
							)}
						>
							Dominance
						</Link>
						<Link
							href="/parity"
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors',
								pathname === '/parity'
									? 'bg-secondary text-secondary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
							)}
						>
							Parity
						</Link>
						<Link
							href="/speculation"
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors',
								pathname === '/speculation'
									? 'bg-secondary text-secondary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
							)}
						>
							Speculation
						</Link>

						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuTrigger
										className={cn(
											'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent',
											pathname.startsWith('/swap-nano') || pathname.startsWith('/get-nano')
												? 'bg-secondary text-secondary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
										)}
									>
										Nano
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="w-fit gap-2 p-4">
											<li className="flex-none">
												<NavigationMenuLink asChild>
													<Link
														href="/get-nano"
														className={cn(
															'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
															pathname === '/get-nano' && 'bg-accent',
														)}
													>
														<div className="flex">
															<Wallet className="h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground" />
															<div className="w-36">
																<div className="text-sm font-medium">Get Nano</div>
																<p className="text-xs text-muted-foreground group-hover:text-accent-foreground">
																	Choose a wallet and acquire XNO
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
															pathname === '/swap-nano' && 'bg-accent',
														)}
													>
														<div className="flex">
															<ArrowRightLeft className="h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground" />
															<div className="w-36">
																<div className="text-sm font-medium">Swap to Nano</div>
																<p className="text-xs text-muted-foreground group-hover:text-accent-foreground">
																	Convert altcoins (BTC, ETH or other crypto) to XNO
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
							<span className="sr-only">Toggle theme</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleRefresh}
							disabled={isRefreshDisabled}
							title={
								isRefreshDisabled ? `Refresh available in ${cooldownRemaining}s` : 'Refresh market data'
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
							<span className="sr-only">Refresh market data</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
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
					aria-label="Close menu"
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
						<span className="font-semibold">Menu</span>
						<Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
							<X className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">Close menu</span>
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
								Home
							</Link>
							<Link
								href="/dominance"
								className={cn(
									'px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/dominance'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								Dominance
							</Link>
							<Link
								href="/parity"
								className={cn(
									'px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/parity'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								Parity
							</Link>
							<Link
								href="/speculation"
								className={cn(
									'px-4 py-3 rounded-md text-sm font-medium transition-colors',
									pathname === '/speculation'
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
								)}
							>
								Speculation
							</Link>

							<div className="my-2 border-t border-border" />

							<div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Nano
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
									<div>Get Nano</div>
									<p className="text-xs text-muted-foreground font-normal">
										Choose a wallet and acquire XNO
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
									<div>Swap to Nano</div>
									<p className="text-xs text-muted-foreground font-normal">Convert altcoins to XNO</p>
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
								About
							</Button>
						</div>
					</div>

					{/* Mobile Menu Footer - Donation */}
					<div className="p-4 border-t border-border">
						<DonationButton />
					</div>
				</div>
			</div>

			<AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />
		</header>
	)
}
