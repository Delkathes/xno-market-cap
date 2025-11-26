import * as v from "valibot"

import { CryptoDataArraySchema, ExchangeRatesSchema } from "./validation"
import { fetchWithTimeout } from "./fetch-with-timeout"
import type { CryptoData, MarketDataResponse } from "./types"

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

const REQUEST_TIMEOUT_MS = 10000

export async function getMarketData(): Promise<MarketDataResponse> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    const headers: HeadersInit = {
      Accept: "application/json",
      ...(apiKey && { "x-cg-demo-api-key": apiKey }),
    }

    const top25Response = await fetchWithTimeout(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h",
      {
        headers,
        next: {
          revalidate: 60,
        },
      } as RequestInit,
      REQUEST_TIMEOUT_MS,
    )

    if (!top25Response.ok) {
      if (top25Response.status === 429) {
        console.error("CoinGecko API rate limit exceeded, using mock data")
        return {
          data: MOCK_DATA,
          eurRate: 0.92,
          gbpRate: 0.79,
          jpyRate: 149.5,
          chfRate: 0.88,
          cadRate: 1.36,
          audRate: 1.53,
        }
      }
      throw new Error("Failed to fetch top 25 cryptocurrencies")
    }

    const top25Json = await top25Response.json()

    const top25Result = v.safeParse(CryptoDataArraySchema, top25Json)
    if (!top25Result.success) {
      console.error("Invalid API response structure for top 25:", top25Result.issues)
      return {
        data: MOCK_DATA,
        eurRate: 0.92,
        gbpRate: 0.79,
        jpyRate: 149.5,
        chfRate: 0.88,
        cadRate: 1.36,
        audRate: 1.53,
      }
    }

    const top25Data: CryptoData[] = top25Result.output.map((item) => ({
      ...item,
      price_change_percentage_24h: item.price_change_percentage_24h ?? 0,
    }))

    // Check if XNO (Nano) is already in top 25
    const hasXNO = top25Data.some((crypto) => crypto.id === "nano")

    const fetchPromises: Promise<Response | null>[] = []

    if (!hasXNO) {
      fetchPromises.push(
        fetchWithTimeout(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=nano&sparkline=false&price_change_percentage=24h",
          {
            headers,
            next: {
              revalidate: 60,
            },
          } as RequestInit,
          REQUEST_TIMEOUT_MS,
        ),
      )
    } else {
      fetchPromises.push(Promise.resolve(null))
    }

    fetchPromises.push(
      fetchWithTimeout(
        "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=eur,gbp,jpy,chf,cad,aud",
        {
          headers,
          next: {
            revalidate: 3600,
          },
        } as RequestInit,
        REQUEST_TIMEOUT_MS,
      ),
    )

    const [xnoResponse, ratesResponse] = await Promise.all(fetchPromises)

    let xnoData: CryptoData | null = null
    if (xnoResponse) {
      if (xnoResponse.ok) {
        const xnoJson = await xnoResponse.json()
        const xnoResult = v.safeParse(CryptoDataArraySchema, xnoJson)
        if (xnoResult.success && xnoResult.output[0]) {
          xnoData = {
            ...xnoResult.output[0],
            price_change_percentage_24h: xnoResult.output[0].price_change_percentage_24h ?? 0,
          }
        }
      } else if (xnoResponse.status === 429) {
        console.error("CoinGecko API rate limit exceeded for XNO, using mock data")
        return {
          data: MOCK_DATA,
          eurRate: 0.92,
          gbpRate: 0.79,
          jpyRate: 149.5,
          chfRate: 0.88,
          cadRate: 1.36,
          audRate: 1.53,
        }
      }
    }

    let eurRate = 0.92
    let gbpRate = 0.79
    let jpyRate = 149.5
    let chfRate = 0.88
    let cadRate = 1.36
    let audRate = 1.53

    if (ratesResponse) {
      if (ratesResponse.ok) {
        const ratesJson = await ratesResponse.json()
        const ratesResult = v.safeParse(ExchangeRatesSchema, ratesJson)
        if (ratesResult.success && ratesResult.output.usd) {
          eurRate = ratesResult.output.usd.eur ?? 0.92
          gbpRate = ratesResult.output.usd.gbp ?? 0.79
          jpyRate = ratesResult.output.usd.jpy ?? 149.5
          chfRate = ratesResult.output.usd.chf ?? 0.88
          cadRate = ratesResult.output.usd.cad ?? 1.36
          audRate = ratesResult.output.usd.aud ?? 1.53
        }
      }
    }

    // Combine data: top 25 + XNO if not already included
    const combinedData = hasXNO ? top25Data : [...top25Data, ...(xnoData ? [xnoData] : [])]

    // Sort by market cap rank
    combinedData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)

    return { data: combinedData, eurRate, gbpRate, jpyRate, chfRate, cadRate, audRate }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timed out, using mock data")
    } else {
      console.error("Error fetching market data:", error)
    }
    return {
      data: MOCK_DATA,
      eurRate: 0.92,
      gbpRate: 0.79,
      jpyRate: 149.5,
      chfRate: 0.88,
      cadRate: 1.36,
      audRate: 1.53,
    }
  }
}
