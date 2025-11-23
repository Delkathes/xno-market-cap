"use client"

import useSWR from "swr"

interface CryptoData {
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

interface MarketDataResponse {
  data: CryptoData[]
  eurRate: number
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch market data")
  }
  return response.json()
}

export function useMarketData() {
  const {
    data: response,
    error,
    isLoading,
  } = useSWR<MarketDataResponse>("/api/market-data", fetcher, {
    refreshInterval: 120000, // Refresh every 2:00min
    revalidateOnFocus: false,
  })

  return {
    data: response?.data,
    eurRate: response?.eurRate ?? 0,
    isLoading,
    error,
  }
}
