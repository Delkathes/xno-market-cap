'use client'

import { useQuery } from '@tanstack/react-query'

import type { MarketDataResponse } from '@/lib/types'

interface ApiErrorResponse {
	error: string
	code?: string
}

const fetcher = async (): Promise<MarketDataResponse> => {
	const response = await fetch('/api/market-data')
	if (!response.ok) {
		const errorData: ApiErrorResponse = await response
			.json()
			.catch(() => ({ error: 'Failed to fetch market data' }))
		throw new Error(errorData.error || 'Failed to fetch market data')
	}
	return response.json()
}

export function useMarketData() {
	const { data, error, isLoading } = useQuery<MarketDataResponse>({
		queryKey: ['market-data'],
		queryFn: fetcher,
		refetchInterval: 120000, // Refresh every 2:00min
		refetchOnWindowFocus: false,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, capped at 30s
	})

	return {
		data: data?.data,
		eurRate: data?.eurRate,
		gbpRate: data?.gbpRate,
		jpyRate: data?.jpyRate,
		chfRate: data?.chfRate,
		cadRate: data?.cadRate,
		audRate: data?.audRate,
		isLoading,
		error,
	}
}
