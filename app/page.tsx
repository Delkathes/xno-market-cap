import { MarketCapTable } from "@/components/market-cap-table"
import { Navigation } from "@/components/navigation"
import { MarketOverview } from "@/components/market-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Cryptocurrency Market Cap Tracker</h1>
          <p className="text-muted-foreground text-lg">Track top cryptocurrencies with XNO (Nano) comparison</p>
        </div>

        <MarketOverview />

        <div className="mt-8">
          <MarketCapTable />
        </div>
      </main>
    </div>
  )
}
