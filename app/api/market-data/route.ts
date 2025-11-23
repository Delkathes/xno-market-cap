import { NextResponse } from "next/server"
import { getMarketData } from "@/lib/market-data-service"

export const runtime = "edge"
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const data = await getMarketData()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
