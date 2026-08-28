'use client'

import { useSetAtom } from 'jotai'
import {
	ArrowRightLeft,
	ChartPie,
	Fingerprint,
	Flag,
	HelpCircle,
	Lightbulb,
	Link2,
	Moon,
	Network,
	RefreshCw,
	Scale,
	ScanSearch,
	Sun,
	Wallet,
	Wrench,
	Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'

import { cn } from '@/lib/utils'

import { useRefreshCooldown } from '@/hooks/use-refresh-cooldown'

import { Button } from '@/components/ui/button'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { LocaleSwitcher } from '@/components/locale-switcher'
// import { DonationButton } from '@/components/donation-button'
import { isAboutOpenAtom } from '@/components/navigation'
import { useTheme } from '@/components/theme-provider'

export function DesktopControls() {
	const t = useTranslations('navigation')

	const { theme, setTheme, resolvedTheme } = useTheme()

	const pathname = usePathname()

	const setIsAboutOpen = useSetAtom(isAboutOpenAtom)

	const { handleRefresh, isRefreshDisabled, cooldownRemaining } = useRefreshCooldown()

	return (
		<div className="hidden md:flex items-center gap-1">
			{/* Donation Button - Desktop only */}
			{/* <DonationButton className="mr-4" /> */}

			<Button
				variant="ghost"
				size="icon"
				className="cursor-pointer"
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

			<LocaleSwitcher />

			<Button
				variant="ghost"
				size="icon"
				className="cursor-pointer"
				onClick={handleRefresh}
				disabled={isRefreshDisabled}
				title={
					isRefreshDisabled ? t('refreshAvailableIn', { seconds: cooldownRemaining }) : t('refreshMarketData')
				}
			>
				<RefreshCw className={cn('h-[1.2rem] w-[1.2rem] transition-all', isRefreshDisabled && 'opacity-50')} />
				{isRefreshDisabled && (
					<span className="absolute text-[10px] font-mono font-bold">{cooldownRemaining}</span>
				)}
				<span className="sr-only">{t('refreshMarketData')}</span>
			</Button>

			<Button variant="ghost" size="icon" onClick={() => setIsAboutOpen(true)} className="mr-2 cursor-pointer">
				<HelpCircle className="h-[1.2rem] w-[1.2rem]" />
				<span className="sr-only">{t('aboutWebsite')}</span>
			</Button>

			<Button variant="ghost" asChild>
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
			</Button>

			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent',
								pathname.startsWith('/tools')
									? 'bg-secondary text-secondary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
							)}
						>
							{t('tools')}
						</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="w-fit gap-2 p-4">
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Wrench
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('toolIndex')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools' && 'bg-accent text-accent-foreground',
														)}
													>
														{t('toolIndexDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools/unit-converter"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools/unit-converter' &&
													'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<ArrowRightLeft
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools/unit-converter' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('toolUnitConverter')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools/unit-converter' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('toolUnitConverterDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools/payment-links"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools/payment-links' &&
													'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Link2
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools/payment-links' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('toolPaymentLinks')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools/payment-links' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('toolPaymentLinksDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools/address-tools"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools/address-tools' &&
													'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Fingerprint
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools/address-tools' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('toolAddressTools')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools/address-tools' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('toolAddressToolsDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools/account-inspector"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools/account-inspector' &&
													'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<ScanSearch
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools/account-inspector' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">
														{t('toolAccountInspector')}
													</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools/account-inspector' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('toolAccountInspectorDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/tools/fee-comparison"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/tools/fee-comparison' &&
													'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Zap
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/tools/fee-comparison' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('toolFeeComparison')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/tools/fee-comparison' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('toolFeeComparisonDescription')}
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

			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger
							className={cn(
								'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-transparent',
								pathname === '/dominance' ||
									pathname === '/parity' ||
									pathname === '/speculation' ||
									pathname === '/milestones' ||
									pathname === '/decentralization'
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
												pathname === '/dominance' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<ChartPie
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/dominance' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('dominance')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
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
												pathname === '/parity' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Scale
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/parity' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('parity')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
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
												pathname === '/speculation' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Zap
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/speculation' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('speculation')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
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
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/decentralization"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/decentralization' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Network
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/decentralization' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('decentralization')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/decentralization' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('decentralizationDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/milestones"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/milestones' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Flag
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/milestones' &&
															'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('milestones')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/milestones' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('milestonesDescription')}
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
								pathname.startsWith('/swap-nano') ||
									pathname.startsWith('/get-nano') ||
									pathname.startsWith('/why-nano')
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
											href="/why-nano"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/why-nano' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Lightbulb
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/why-nano' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('whyNano')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
															pathname === '/why-nano' &&
																'bg-accent text-accent-foreground',
														)}
													>
														{t('whyNanoDescription')}
													</p>
												</div>
											</div>
										</Link>
									</NavigationMenuLink>
								</li>
								<li className="flex-none">
									<NavigationMenuLink asChild>
										<Link
											href="/get-nano"
											className={cn(
												'group flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												pathname === '/get-nano' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<Wallet
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/get-nano' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('getNano')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
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
												pathname === '/swap-nano' && 'bg-accent text-accent-foreground',
											)}
										>
											<div className="flex">
												<ArrowRightLeft
													className={cn(
														'h-5 w-5 relative top-1 text-primary mr-4 flex-none group-hover:text-accent-foreground group-focus:text-accent-foreground',
														pathname === '/swap-nano' && 'bg-accent text-accent-foreground',
													)}
												/>
												<div className="w-36">
													<div className="text-sm font-medium">{t('swapToNano')}</div>
													<p
														className={cn(
															'text-xs text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground',
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
	)
}
