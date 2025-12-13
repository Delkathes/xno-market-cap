import { useSyncExternalStore } from 'react'

export function useIsClientSide(): boolean {
	return useSyncExternalStore(
		() => () => {}, // subscribe (no-op)
		() => true, // client snapshot
		() => false, // server snapshot
	)
}
