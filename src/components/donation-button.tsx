'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Heart } from 'lucide-react'

import { ALLOWED_GOAL_ORIGINS, DONATION_GOAL_XNO, DONATION_MILESTONES, DONATION_WALLET_FINAL } from '@/lib/constants'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { isValidNanoAddress, rawToXno } from '@/lib/nano-utils'
import { cn } from '@/lib/utils'
import { validateNanoBalanceResponse } from '@/lib/validation'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import { DonationModal } from './donation-modal'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
const BALANCE_POLL_INTERVAL_MS = 60000
const REQUEST_TIMEOUT_MS = 10000

function isAllowedOrigin(): boolean {
	if (typeof window === 'undefined') return false

	const origin = window.location.origin

	// Check if matches APP_URL
	if (APP_URL && origin === APP_URL) return true

	// Check against allowed patterns (Vercel, Netlify, localhost)
	return ALLOWED_GOAL_ORIGINS.some((pattern) => pattern.test(origin))
}

// Type for milestone balances
export type MilestoneBalances = Record<string, number>

export function DonationButton({ className }: { className?: string }) {
	const [open, setOpen] = useState(false)

	const { milestoneBalances, totalDonations, isLoading, refreshBalance, allMilestonesComplete, activeWalletAddress } =
		useDonationBalance()
	const showGoalMode = useDonationGoalMode(allMilestonesComplete)
	const hasAnimatedIn = useDonationEntranceAnimation(isLoading)

	const progress = Math.min((totalDonations / DONATION_GOAL_XNO) * 100, 100)

	const buttonAnimationClasses = cn(
		'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out',
		hasAnimatedIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
	)

	// Check if any milestone wallet is configured
	const hasWalletConfigured = DONATION_MILESTONES.some((m) => m.walletAddress) || DONATION_WALLET_FINAL

	if (!hasWalletConfigured) {
		return null
	}

	if (isLoading) {
		return null
	}

	if (!showGoalMode) {
		return (
			<>
				<Button
					variant="default"
					className={cn(
						className,
						'flex items-center gap-2 h-auto pt-2.5 px-3 border-accent/50 dark:border-accent/50',
						buttonAnimationClasses,
					)}
					onClick={() => setOpen(true)}
				>
					<Heart className="h-4 w-4 text-red-500 fill-red-500" />
					<span className="text-xs font-medium">Support Us</span>
				</Button>

				<DonationModal
					open={open}
					onOpenChange={setOpen}
					milestoneBalances={milestoneBalances}
					totalDonations={totalDonations}
					onDonationReceived={refreshBalance}
					goalMode={false}
					allMilestonesComplete={allMilestonesComplete}
					activeWalletAddress={activeWalletAddress}
				/>
			</>
		)
	}

	// Goal mode button with progress
	return (
		<>
			<Button
				variant="default"
				className={cn(
					className,
					'border flex items-center text-primary gap-2 h-auto pt-2.5 px-3 bg-transparent hover:bg-transparent cursor-pointer border-accent/50 dark:border-accent/50',
					buttonAnimationClasses,
				)}
				onClick={() => setOpen(true)}
			>
				<Heart className="h-4 w-4 text-red-500 fill-red-500" />
				<div className="flex flex-col items-start gap-0.5">
					<span className="text-xs font-medium leading-none">Donation Goal</span>
					<div className="flex items-center gap-2">
						<Progress value={progress} className="h-1.5 w-16" />
						<span className="text-[10px] text-muted-foreground font-mono leading-none">
							{isLoading ? '...' : `${progress.toFixed(0)}%`}
						</span>
					</div>
				</div>
			</Button>

			<DonationModal
				open={open}
				onOpenChange={setOpen}
				milestoneBalances={milestoneBalances}
				totalDonations={totalDonations}
				onDonationReceived={refreshBalance}
				goalMode={true}
				allMilestonesComplete={allMilestonesComplete}
				activeWalletAddress={activeWalletAddress}
			/>
		</>
	)
}

function useDonationGoalMode(allMilestonesComplete: boolean) {
	const [showGoalMode, setShowGoalMode] = useState(false)

	useEffect(() => {
		const allowed = isAllowedOrigin()
		// Show goal mode if allowed origin and milestones are not all complete
		const goalMode = allowed && !allMilestonesComplete
		setShowGoalMode(goalMode)
	}, [allMilestonesComplete])

	return showGoalMode
}

function useDonationEntranceAnimation(isLoading: boolean) {
	const [hasAnimatedIn, setHasAnimatedIn] = useState(false)

	useEffect(() => {
		if (isLoading) {
			setHasAnimatedIn(false)
			return
		}

		if (typeof window === 'undefined') {
			setHasAnimatedIn(true)
			return
		}

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		if (mediaQuery.matches) {
			setHasAnimatedIn(true)
			return
		}

		const frame = window.requestAnimationFrame(() => setHasAnimatedIn(true))
		return () => window.cancelAnimationFrame(frame)
	}, [isLoading])

	return hasAnimatedIn
}

async function fetchWalletBalance(walletAddress: string): Promise<number> {
	if (!walletAddress) return 0

	// Validate wallet address before making RPC call
	if (!isValidNanoAddress(walletAddress)) {
		console.error(`Invalid wallet address: ${walletAddress}`)
		return 0
	}

	try {
		const response = await fetchWithTimeout(
			'https://rpc.nano.to',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'account_balance',
					account: walletAddress,
				}),
			},
			REQUEST_TIMEOUT_MS,
		)

		if (response.ok) {
			const data = await response.json()
			const validation = validateNanoBalanceResponse(data)
			if (validation.success && validation.balance) {
				return rawToXno(validation.balance)
			}
		}
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			console.error(`Balance fetch timed out for ${walletAddress}`)
		}
	}

	return 0
}

function useDonationBalance() {
	const [milestoneBalances, setMilestoneBalances] = useState<MilestoneBalances>({})
	const [isLoading, setIsLoading] = useState(true)

	const fetchAllBalances = useCallback(async () => {
		const balances: MilestoneBalances = {}

		// Fetch balances for all milestones in parallel
		const results = await Promise.all(
			DONATION_MILESTONES.map(async (milestone) => {
				const balance = await fetchWalletBalance(milestone.walletAddress)
				return { id: milestone.id, balance }
			}),
		)

		for (const { id, balance } of results) {
			balances[id] = balance
		}

		setMilestoneBalances(balances)
		setIsLoading(false)
	}, [])

	useEffect(() => {
		fetchAllBalances()

		const interval = setInterval(fetchAllBalances, BALANCE_POLL_INTERVAL_MS)
		return () => clearInterval(interval)
	}, [fetchAllBalances])

	// Calculate total donations across all milestones
	const totalDonations = useMemo(() => {
		return Object.values(milestoneBalances).reduce((sum, balance) => sum + balance, 0)
	}, [milestoneBalances])

	// Determine if all milestones are complete
	const allMilestonesComplete = useMemo(() => {
		return DONATION_MILESTONES.every((milestone) => {
			const balance = milestoneBalances[milestone.id] || 0
			return balance >= milestone.targetXno
		})
	}, [milestoneBalances])

	// Determine the active wallet address (first incomplete milestone, or final wallet if all complete)
	const activeWalletAddress = useMemo(() => {
		if (allMilestonesComplete) {
			return DONATION_WALLET_FINAL
		}

		// Find first incomplete milestone
		for (const milestone of DONATION_MILESTONES) {
			const balance = milestoneBalances[milestone.id] || 0
			if (balance < milestone.targetXno) {
				return milestone.walletAddress
			}
		}

		return DONATION_WALLET_FINAL
	}, [milestoneBalances, allMilestonesComplete])

	return {
		milestoneBalances,
		totalDonations,
		isLoading,
		refreshBalance: fetchAllBalances,
		allMilestonesComplete,
		activeWalletAddress,
	}
}
