import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { getMarketData } from "@/lib/market-data-service"
import getQueryClient from "@/lib/get-query-client"
import { MarketCapTable } from "@/components/market-cap-table"
import { MarketOverview } from "@/components/market-overview"

export const dynamic = "force-static"
export const revalidate = 60

export default async function Home() {
  const queryClient = getQueryClient()

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["market-data"],
    queryFn: getMarketData,
  })

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hydrate the query cache with the initial data */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MarketOverview />
        <div className="mt-8">
          <MarketCapTable />
        </div>
      </HydrationBoundary>
    </main>
  )
}
