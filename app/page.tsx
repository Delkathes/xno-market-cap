import { MarketCapTable } from "@/components/market-cap-table"
import { MarketOverview } from "@/components/market-overview"
import { getMarketData } from "@/lib/market-data-service"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"

export const dynamic = "force-static"
export const revalidate = 60

export default async function Home() {
  const queryClient = new QueryClient()

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["market-data"],
    queryFn: getMarketData,
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Cryptocurrency Market Cap Tracker</h1>
        <p className="text-muted-foreground text-lg">Track top cryptocurrencies with XNO (Nano) comparison</p>
      </div>

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
