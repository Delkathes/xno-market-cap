import { DominanceChart } from "@/components/dominance-chart"
import { DominanceTable } from "@/components/dominance-table"

export default function DominancePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Market Dominance</h1>
        <p className="text-muted-foreground text-lg">Analyze cryptocurrency market share and dominance</p>
      </div>

      <div className="grid gap-6 mb-8">
        <DominanceChart />
      </div>

      <DominanceTable />
    </main>
  )
}
