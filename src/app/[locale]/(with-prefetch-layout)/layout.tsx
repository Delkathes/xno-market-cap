import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import getQueryClient from '@/lib/get-query-client'
import { getMarketData } from '@/lib/market-data-service'

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export const dynamic = 'force-static'
export const revalidate = 60

export default async function RootLayout({ children }: Props) {
	const queryClient = getQueryClient()

	// Prefetch data on the server
	await queryClient.prefetchQuery({
		queryKey: ['market-data'],
		queryFn: getMarketData,
	})

	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
