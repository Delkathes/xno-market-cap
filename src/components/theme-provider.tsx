'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
	theme: Theme
	setTheme: (theme: Theme) => void
	resolvedTheme: ResolvedTheme
	themes: Theme[]
	systemTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEMES: Theme[] = ['light', 'dark', 'system']

const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem('theme')
    var theme = stored === 'light' || stored === 'dark' ? stored : 'system'
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    var root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(isDark ? 'dark' : 'light')
    root.style.colorScheme = isDark ? 'dark' : 'light'
  } catch (e) {}
})()`

function getSystemTheme(): ResolvedTheme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light'
}

function readStoredTheme(): Theme | null {
	if (typeof window === 'undefined') return null
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === 'light' || stored === 'dark') return stored
	} catch {}
	return null
}

function applyTheme(resolved: ResolvedTheme) {
	const root = document.documentElement
	root.classList.remove('light', 'dark')
	root.classList.add(resolved)
	root.style.colorScheme = resolved
}

function suppressTransitions() {
	const style = document.createElement('style')
	style.textContent = '*,*::before,*::after{transition:none!important}'
	document.head.appendChild(style)
	window.getComputedStyle(document.documentElement)
	setTimeout(() => style.remove(), 1)
}

// Module-scope flag that survives the remounts triggered by locale switches:
// the init script only needs to run once per page load (before hydration), and the
// html element persists across client-side navigations with its theme class intact.
let scriptInjected = false

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	disableTransitionOnChange = false,
}: {
	children: ReactNode
	defaultTheme?: Theme
	disableTransitionOnChange?: boolean
}) {
	const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? defaultTheme)
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

	useEffect(() => {
		// Re-apply once on mount (the init script already set the class pre-hydration;
		// this guards the edge where the script didn't run). setTheme handles changes.
		const stored = readStoredTheme() ?? defaultTheme
		applyTheme(stored === 'system' ? getSystemTheme() : stored)
	}, [defaultTheme])

	useEffect(() => {
		scriptInjected = true
	}, [])

	useEffect(() => {
		const query = window.matchMedia(COLOR_SCHEME_QUERY)
		const handler = (event: MediaQueryListEvent) => {
			const next = event.matches ? 'dark' : 'light'
			setSystemTheme(next)
			if (theme === 'system') applyTheme(next)
		}
		query.addEventListener('change', handler)
		return () => query.removeEventListener('change', handler)
	}, [theme])

	useEffect(() => {
		const handler = (event: StorageEvent) => {
			if (event.key !== STORAGE_KEY) return
			setThemeState(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system')
		}
		window.addEventListener('storage', handler)
		return () => window.removeEventListener('storage', handler)
	}, [])

	const setTheme = useCallback(
		(next: Theme) => {
			const resolved = next === 'system' ? getSystemTheme() : next
			applyTheme(resolved)
			if (disableTransitionOnChange) suppressTransitions()
			try {
				localStorage.setItem(STORAGE_KEY, next)
			} catch {}
			setThemeState(next)
		},
		[disableTransitionOnChange],
	)

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme,
			resolvedTheme: theme === 'system' ? systemTheme : theme,
			themes: THEMES,
			systemTheme,
		}),
		[theme, setTheme, systemTheme],
	)

	return (
		<ThemeContext.Provider value={value}>
			{scriptInjected ? null : (
				<script
					suppressHydrationWarning
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static theme init script, no user input
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
			)}
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
