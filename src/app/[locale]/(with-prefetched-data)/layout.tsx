import { cacheLife } from 'next/cache'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

// Cache the data fetch, not the component
async function getCachedMarketData() {
	'use cache'
	cacheLife('minutes')
	return getMarketData()
}

export default async function PrefetchLayout({ children }: Props) {
	'use cache'
	cacheLife('minutes')
	const queryClient = getQueryClient()

	void queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getCachedMarketData,
	})

	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
