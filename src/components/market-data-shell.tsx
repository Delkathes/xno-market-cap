import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

// Server component that prefetches the market data on the server and hydrates
// the React Query cache on the client. Must be rendered INSIDE a cached page
// ('use cache'), never in a layout: a cached layout receives external children
// as streamed references which lose their keys once the dehydrated payload
// forces a stream split (dev-only React key warning), and rendering the shell
// inside a cached page keeps the whole segment self-contained. The group
// layout's `connection()` marks these routes request-time, so the SDK's
// internal Date.now() never runs during static prerendering.
export default async function MarketDataShell({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
