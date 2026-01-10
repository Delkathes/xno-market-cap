'use client'

import { useQuery } from '@tanstack/react-query'

import type { ChartTimeRange, FiatCurrencyCode, PriceChartResponse } from '@/lib/types'

interface ApiErrorResponse {
	error: string
	code?: string
}

const fetcher = async (
	coinId: string,
	days: ChartTimeRange,
	vsCurrency?: FiatCurrencyCode,
): Promise<PriceChartResponse> => {
	const params = new URLSearchParams({ coinId, days })
	if (vsCurrency) {
		params.set('vsCurrency', vsCurrency)
	}
	const response = await fetch(`/api/price-chart?${params.toString()}`)
	if (!response.ok) {
		const errorData: ApiErrorResponse = await response
			.json()
			.catch(() => ({ error: 'Failed to fetch price chart' }))
		throw new Error(errorData.error || 'Failed to fetch price chart')
	}
	return response.json()
}

export function usePriceChart(coinId: string, days: ChartTimeRange, vsCurrency?: FiatCurrencyCode) {
	const { data, error, isLoading, isFetching } = useQuery<PriceChartResponse>({
		queryKey: ['price-chart', coinId, days, vsCurrency],
		queryFn: () => fetcher(coinId, days, vsCurrency),
		refetchInterval: days === '1' ? 300000 : 900000, // 5min for 1d, 15min for others
		refetchOnWindowFocus: false,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		staleTime: days === '1' ? 60000 : 300000, // 1min for 1d, 5min for others
		enabled: Boolean(coinId),
	})

	return {
		data,
		prices: data?.prices ?? [],
		isLoading,
		isFetching,
		error,
	}
}
