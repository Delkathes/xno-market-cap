'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import type { MarketDataResponse } from '@/lib/types'

import { env } from '@/env'

interface ApiErrorResponse {
	error: string
	code?: string
}

export const fetchMarketData = async (): Promise<MarketDataResponse> => {
	// Relative on the client so LAN/Tailscale testing hits the host the page
	// was served from; absolute only during SSR (no origin available).
	const baseUrl = env.NODE_ENV === 'development' && typeof window === 'undefined' ? env.NEXT_PUBLIC_SITE_URL : ''
	const response = await fetch(`${baseUrl}/api/market-data`)
	if (!response.ok) {
		const errorData: ApiErrorResponse = await response
			.json()
			.catch(() => ({ error: 'Failed to fetch market data' }))
		const error = new Error(errorData.error || 'Failed to fetch market data') as Error & { status?: number }
		error.status = response.status
		throw error
	}
	return response.json()
}

export function useMarketData(initialData?: MarketDataResponse) {
	const { data, error, isLoading, dataUpdatedAt } = useSuspenseQuery<MarketDataResponse>({
		queryKey: ['market-data'],
		queryFn: fetchMarketData,
		initialData,
		refetchInterval: 60000, // Refresh every 1:00min
		refetchOnWindowFocus: false,
		// Don't retry rate-limited requests (429 own API, 503 upstream) — retrying
		// only amplifies the load that caused the rate limit.
		retry: (failureCount, error) => {
			const status = (error as Error & { status?: number }).status
			return status !== 429 && status !== 503 && failureCount < 3
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, capped at 30s
		staleTime: 60000, // Data is fresh for 1:00min
	})

	return {
		data: data?.data,

		eurRate: data?.eurRate,
		gbpRate: data?.gbpRate,
		jpyRate: data?.jpyRate,
		chfRate: data?.chfRate,
		cadRate: data?.cadRate,
		audRate: data?.audRate,

		xnoData: data?.xnoData,
		xnoCirculatingSupply: data?.xnoData?.circulating_supply ?? 0,
		xnoPriceChange1h: data?.xnoPriceChange1h,
		xnoPriceChange24h: data?.xnoPriceChange24h,
		xnoPriceChange7d: data?.xnoPriceChange7d,

		isLoading,
		error,
		fetchedAt: dataUpdatedAt,
	}
}
