'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { env } from '@/env'

import { DONATION_MILESTONES, type MilestoneBalances } from '@/components/donation-modal'

const DONATION_WALLET_FINAL = env.NEXT_PUBLIC_DONATION_WALLET_FINAL

interface DonationBalanceResponse {
	milestoneBalances: MilestoneBalances
	totalDonations: number
	allMilestonesComplete: boolean
	activeWalletAddress: string
}

async function fetchDonationBalance(): Promise<DonationBalanceResponse> {
	const response = await fetch('/api/donation-balance')

	if (!response.ok) {
		throw new Error('Failed to fetch donation balance')
	}

	return response.json()
}

export function useDonationBalance() {
	const queryClient = useQueryClient()

	const { data, isLoading, error } = useQuery({
		queryKey: ['donation-balance'],
		queryFn: fetchDonationBalance,
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000, // Refetch every 60 seconds
		refetchOnWindowFocus: true,
	})

	const refreshBalance = () => {
		queryClient.invalidateQueries({ queryKey: ['donation-balance'] })
	}

	// Check if any wallet is configured
	const hasWalletConfigured = DONATION_MILESTONES.some((m) => m.walletAddress) || !!DONATION_WALLET_FINAL

	return {
		milestoneBalances: data?.milestoneBalances ?? {},
		totalDonations: data?.totalDonations ?? 0,
		allMilestonesComplete: data?.allMilestonesComplete ?? false,
		activeWalletAddress: data?.activeWalletAddress ?? DONATION_WALLET_FINAL,
		isLoading,
		error,
		refreshBalance,
		hasWalletConfigured,
	}
}
