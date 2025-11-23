"use client"

import { useQuery } from "@tanstack/react-query"
import type { MarketDataResponse } from "@/lib/market-data-service"

const fetcher = async () => {
  const response = await fetch("/api/market-data")
  if (!response.ok) {
    throw new Error("Failed to fetch market data")
  }
  return response.json()
}

export function useMarketData() {
  const { data, error, isLoading } = useQuery<MarketDataResponse>({
    queryKey: ["market-data"],
    queryFn: fetcher,
    refetchInterval: 120000, // Refresh every 2:00min
    refetchOnWindowFocus: false,
  })

  return {
    data: data?.data,
    eurRate: data?.eurRate ?? 0.92,
    isLoading,
    error,
  }
}
