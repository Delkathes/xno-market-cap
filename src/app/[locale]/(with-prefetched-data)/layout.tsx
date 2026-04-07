import { cacheLife } from 'next/cache'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export default async function PrefetchLayout({ children }: Props) {
	'use cache'
	cacheLife('hours')
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
