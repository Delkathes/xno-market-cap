'use client'

import { useAtom } from 'jotai'
import { Menu, Moon, RefreshCw, Sun, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import { useRefreshCooldown } from '@/hooks/use-refresh-cooldown'

import { Button } from '@/components/ui/button'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { isMobileMenuOpenAtom } from '@/components/mobile-menu-panel'
import { useTheme } from '@/components/theme-provider'

export function MobileControls() {
	const t = useTranslations('navigation')

	const { theme, setTheme } = useTheme()

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(isMobileMenuOpenAtom)

	const { handleRefresh, isRefreshDisabled, cooldownRemaining } = useRefreshCooldown()

	return (
		<div className="flex md:hidden items-center gap-1">
			<Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">{t('toggleTheme')}</span>
			</Button>

			<LocaleSwitcher />

			<Button
				variant="ghost"
				size="icon"
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

			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				aria-label={t('toggleMenu')}
			>
				{isMobileMenuOpen ? (
					<X className="h-[1.2rem] w-[1.2rem]" />
				) : (
					<Menu className="h-[1.2rem] w-[1.2rem]" />
				)}
			</Button>
		</div>
	)
}
