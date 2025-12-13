import { cache } from 'react'
import { QueryClient } from '@tanstack/react-query'

// Using React cache() ensures we get the same QueryClient across a single request
// but a new one for each request (avoiding cross-request state pollution)
const getQueryClient = cache(
	() =>
		new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 60 * 1000, // 1 minute
				},
			},
		}),
)

export default getQueryClient
