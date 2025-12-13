import { useSyncExternalStore } from 'react'

export function useIsMobile(breakpoint: number = 768): boolean {
	return useSyncExternalStore(
		(callback) => {
			const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
			mediaQuery.addEventListener('change', callback)
			return () => mediaQuery.removeEventListener('change', callback)
		},
		() => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches, // client
		() => false, // server snapshot (safe default)
	)
}
