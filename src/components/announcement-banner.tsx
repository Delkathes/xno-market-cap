'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

// Versioned so future announcements reuse the mechanism (bump the key).
export const ANNOUNCEMENT_STORAGE_KEY = 'nmc.announcement.widgets.v1'

/**
 * Site-wide launch banner: a slim teletype strip under the nav, rendered
 * server-side in the flow (space is reserved, no layout shift). Returning
 * users who dismissed it are hidden pre-paint: the theme init script sets
 * data-announcement-dismissed on <html>, and globals.css hides the strip.
 * Shown on every page, including /widgets.
 */
export function AnnouncementBanner() {
	const t = useTranslations('announcement')
	const [dismissed, setDismissed] = useState(false)

	const dismiss = () => {
		setDismissed(true)
		try {
			localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, '1')
		} catch {}
		document.documentElement.setAttribute('data-announcement-dismissed', '1')
	}

	if (dismissed) return null

	return (
		<div className="announcement-banner animate-fade-in-up border-b border-dashed border-border bg-card backdrop-blur-xl">
			<div className="container mx-auto flex items-center gap-3 px-4 py-2">
				<span aria-hidden="true" className="relative flex h-2 w-2 flex-none">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#209CE9] opacity-60" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-[#209CE9]" />
				</span>
				<span className="hidden font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/90 sm:inline">
					&lt; {t('kicker')} &gt;
				</span>
				<p className="min-w-0 flex-1 truncate text-xs text-foreground/90">
					<span className="font-semibold">{t('title')}</span>
					<span aria-hidden="true" className="mx-1.5 text-muted-foreground/40">
						·
					</span>
					<span className="hidden text-muted-foreground sm:inline">{t('body')}</span>
				</p>
				<Link
					href="/widgets"
					className="group flex flex-none cursor-pointer items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
				>
					{t('cta')}
					<span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
						→
					</span>
				</Link>
				<button
					type="button"
					onClick={dismiss}
					aria-label={t('dismiss')}
					className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-sm text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	)
}
