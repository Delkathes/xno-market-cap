'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'

import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { LOCALES } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const LOCALE_FLAGS: Record<string, string> = {
	en: '🇬🇧',
	fr: '🇫🇷',
	de: '🇩🇪',
	es: '🇪🇸',
	it: '🇮🇹',
	nl: '🇳🇱',
}

const LOCALE_LABELS: Record<string, string> = {
	en: 'English',
	fr: 'Français',
	de: 'Deutsch',
	es: 'Español',
	it: 'Italiano',
	nl: 'Nederlands',
}

export function LocaleSwitcher({ className }: { className?: string }) {
	const locale = useLocale()
	const router = useRouter()
	const pathname = usePathname()
	const [open, setOpen] = useState(false)

	function switchLocale(next: Locale) {
		setOpen(false)
		router.replace(pathname, { locale: next })
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Switch language"
					className={cn(
						'h-11 w-11 cursor-pointer justify-center bg-transparent p-0 hover:bg-accent',
						className,
					)}
				>
					<span className="text-base leading-none">{LOCALE_FLAGS[locale] ?? locale.toUpperCase()}</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-44 p-1">
				<div className="flex flex-col gap-1">
					{LOCALES.map((availableLocale) => {
						const isActive = availableLocale === locale

						return (
							<Button
								key={availableLocale}
								type="button"
								variant="ghost"
								className="w-full justify-start px-2 py-2 font-normal"
								onClick={() => switchLocale(availableLocale as Locale)}
							>
								<span className="text-base leading-none">{LOCALE_FLAGS[availableLocale]}</span>
								<span className="flex-1 text-left">{LOCALE_LABELS[availableLocale]}</span>
								{isActive ? <Check className="size-4 text-primary" /> : null}
							</Button>
						)
					})}
				</div>
			</PopoverContent>
		</Popover>
	)
}
