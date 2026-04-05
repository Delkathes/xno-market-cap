import { cache } from 'react'
import { environmentManager, QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000, // 1 minute
			},
		},
	})
}

const getServerQueryClient = cache(makeQueryClient)

let browserQueryClient: QueryClient | undefined

// Server: one QueryClient per request via React cache().
// Browser: a stable singleton across renders to preserve hydration/cache state.
function getQueryClient() {
	if (environmentManager.isServer()) {
		return getServerQueryClient()
	}

	browserQueryClient ??= makeQueryClient()
	return browserQueryClient
}

export default getQueryClient
