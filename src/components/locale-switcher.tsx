'use client'

import { useLocale } from 'next-intl'

import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { LOCALES } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

	function switchLocale(next: Locale) {
		router.replace(pathname, { locale: next })
	}

	return (
		<Select value={locale} onValueChange={(value) => switchLocale(value as Locale)}>
			<SelectTrigger
				aria-label="Switch language"
				className={cn(
					'h-9 w-9 cursor-pointer justify-center border-0 bg-transparent p-0 shadow-none hover:bg-accent focus-visible:ring-1 [&>svg]:hidden',
					className,
				)}
			>
				<SelectValue aria-label={LOCALE_LABELS[locale]}>
					<span className="text-base leading-none">{LOCALE_FLAGS[locale] ?? locale.toUpperCase()}</span>
				</SelectValue>
			</SelectTrigger>

			<SelectContent align="end">
				{LOCALES.map((availableLocale) => (
					<SelectItem key={availableLocale} value={availableLocale}>
						<span>{LOCALE_FLAGS[availableLocale]}</span>
						<span>{LOCALE_LABELS[availableLocale]}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
