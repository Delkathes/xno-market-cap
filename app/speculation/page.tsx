import { SpeculationTable } from "@/components/speculation-table"
import { getMarketData } from "@/lib/market-data-service"
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"

export const dynamic = "force-static"
export const revalidate = 60

export default async function SpeculationPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["market-data"],
    queryFn: getMarketData,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Speculation</h1>
          <p className="text-muted-foreground text-lg">
            What would XNO be worth if it had the same market cap as other cryptocurrencies?
          </p>
        </div>

        <SpeculationTable />
      </main>
    </HydrationBoundary>
  )
}
