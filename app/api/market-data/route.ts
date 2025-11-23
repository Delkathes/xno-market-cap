import { NextResponse } from "next/server"

export const runtime = "edge"
export const revalidate = 60 // Cache for 60 seconds

interface CoinGeckoResponse {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
}

export async function GET() {
  try {
    // Fetch top 25 cryptocurrencies by market cap
    const top25Response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h",
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!top25Response.ok) {
      throw new Error("Failed to fetch top 25 cryptocurrencies")
    }

    const top25Data: CoinGeckoResponse[] = await top25Response.json()

    // Check if XNO (Nano) is already in top 25
    const hasXNO = top25Data.some((crypto) => crypto.id === "nano")

    const fetchPromises = []

    if (!hasXNO) {
      fetchPromises.push(
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=nano&sparkline=false&price_change_percentage=24h",
          {
            headers: {
              Accept: "application/json",
            },
          },
        ),
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    // Fetch EUR/USD exchange rate
    fetchPromises.push(
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=eur", {
        headers: {
          Accept: "application/json",
        },
      }),
    )

    const [xnoResponse, eurResponse] = await Promise.all(fetchPromises)

    let xnoData: CoinGeckoResponse | null = null
    if (xnoResponse && xnoResponse.ok) {
      const xnoArray: CoinGeckoResponse[] = await xnoResponse.json()
      xnoData = xnoArray[0] || null
    }

    let eurRate = 0.92 // Fallback EUR/USD rate
    if (eurResponse && eurResponse.ok) {
      const eurData = await eurResponse.json()
      eurRate = eurData.usd?.eur || 0.92
    }

    // Combine data: top 25 + XNO if not already included
    const combinedData = hasXNO ? top25Data : [...top25Data, ...(xnoData ? [xnoData] : [])]

    // Sort by market cap rank
    combinedData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)

    return NextResponse.json(
      { data: combinedData, eurRate },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
