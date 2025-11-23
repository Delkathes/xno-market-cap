export interface CryptoData {
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

export interface MarketDataResponse {
  data: CryptoData[]
  eurRate: number
}

const MOCK_DATA: CryptoData[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 95432,
    market_cap: 1890000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    total_volume: 50000000000,
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 2850,
    market_cap: 342000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.2,
    total_volume: 20000000000,
  },
  {
    id: "nano",
    symbol: "xno",
    name: "Nano",
    image: "https://assets.coingecko.com/coins/images/75/large/nano.png",
    current_price: 1.25,
    market_cap: 166500000,
    market_cap_rank: 250,
    price_change_percentage_24h: 5.5,
    total_volume: 2000000,
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    current_price: 1.0,
    market_cap: 103000000000,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.01,
    total_volume: 45000000000,
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 580,
    market_cap: 89000000000,
    market_cap_rank: 4,
    price_change_percentage_24h: -1.5,
    total_volume: 1200000000,
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 145,
    market_cap: 65000000000,
    market_cap_rank: 5,
    price_change_percentage_24h: 3.8,
    total_volume: 3500000000,
  },
]

export async function getMarketData(): Promise<MarketDataResponse> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    const options: RequestInit = {
      headers: {
        Accept: "application/json",
        ...(apiKey && { "x-cg-demo-api-key": apiKey }),
      },
      next: {
        revalidate: 60, // Revalidate every 60 seconds
      },
    }

    // Fetch top 25 cryptocurrencies by market cap
    const top25Response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h",
      options,
    )

    if (!top25Response.ok) {
      if (top25Response.status === 429) {
        console.error("CoinGecko API rate limit exceeded, using mock data")
        return { data: MOCK_DATA, eurRate: 0.92 }
      }
      throw new Error("Failed to fetch top 25 cryptocurrencies")
    }

    const top25Data: CryptoData[] = await top25Response.json()

    // Check if XNO (Nano) is already in top 25
    const hasXNO = top25Data.some((crypto) => crypto.id === "nano")

    const fetchPromises = []

    if (!hasXNO) {
      fetchPromises.push(
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=nano&sparkline=false&price_change_percentage=24h",
          options,
        ),
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    // Fetch EUR/USD exchange rate
    fetchPromises.push(
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=eur", {
        ...options,
        next: {
          revalidate: 3600, // Exchange rates change less frequently, cache for 1 hour
        },
      }),
    )

    const [xnoResponse, eurResponse] = await Promise.all(fetchPromises)

    let xnoData: CryptoData | null = null
    if (xnoResponse) {
      if (xnoResponse.ok) {
        const xnoArray: CryptoData[] = await xnoResponse.json()
        xnoData = xnoArray[0] || null
      } else if (xnoResponse.status === 429) {
        console.error("CoinGecko API rate limit exceeded for XNO, using mock data")
        return { data: MOCK_DATA, eurRate: 0.92 }
      }
    }

    let eurRate = 0.92 // Fallback EUR/USD rate
    if (eurResponse) {
      if (eurResponse.ok) {
        const eurData = await eurResponse.json()
        eurRate = eurData.usd?.eur || 0.92
      }
    }

    // Combine data: top 25 + XNO if not already included
    const combinedData = hasXNO ? top25Data : [...top25Data, ...(xnoData ? [xnoData] : [])]

    // Sort by market cap rank
    combinedData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)

    return { data: combinedData, eurRate }
  } catch (error) {
    console.error("Error fetching market data:", error)
    return { data: MOCK_DATA, eurRate: 0.92 }
  }
}
