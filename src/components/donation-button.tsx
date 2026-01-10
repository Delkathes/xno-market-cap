'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ALLOWED_GOAL_ORIGINS } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { useDonationBalance } from '@/hooks/use-donation-balance'

import { env } from '@/env'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DONATION_GOAL_XNO, DonationModal } from '@/components/donation-modal'

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

export function DonationButton({ className }: { className?: string }) {
	const t = useTranslations('donation')

	const [open, setOpen] = useState(false)

	const {
		milestoneBalances,
		totalDonations,
		isLoading,
		refreshBalance,
		allMilestonesComplete,
		activeWalletAddress,
		hasWalletConfigured,
	} = useDonationBalance()
	const showGoalMode = useDonationGoalMode(allMilestonesComplete)
	const hasAnimatedIn = useDonationEntranceAnimation(isLoading)

	const progress = Math.min((totalDonations / DONATION_GOAL_XNO) * 100, 100)

	const buttonAnimationClasses = cn(
		'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out',
		hasAnimatedIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
	)

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
					<span className="text-xs font-medium">{t('supportUs')}</span>
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
					<span className="text-xs font-medium leading-none">{t('donationGoal')}</span>
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

function isAllowedOrigin(): boolean {
	if (typeof window === 'undefined') return false

	const origin = window.location.origin

	// Check if matches APP_URL
	if (SITE_URL && origin === SITE_URL) return true

	// Check against allowed patterns (Vercel, Netlify, localhost)
	return ALLOWED_GOAL_ORIGINS.some((pattern) => pattern.test(origin))
}
